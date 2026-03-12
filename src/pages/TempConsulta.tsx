import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import FuturisticFooter from '@/components/FuturisticFooter';
import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock3, FileText } from 'lucide-react';
import { tempConsultationShareService } from '@/services/tempConsultationShareService';
import CpfResultDisplay from '@/components/dashboard/CpfResultDisplay';
import ReceitaFederalDisplay from '@/components/dashboard/ReceitaFederalDisplay';
import FotosSection from '@/components/dashboard/FotosSection';
import ScoreGaugeCard from '@/components/dashboard/ScoreGaugeCard';

const extractShareKey = (search: string) => {
  const params = new URLSearchParams(search);
  const explicit = params.get('k') || params.get('key');
  if (explicit) return explicit;

  const raw = search.replace(/^\?/, '');
  if (raw.startsWith('=')) {
    return decodeURIComponent(raw.slice(1));
  }

  return '';
};

const hasValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    return normalized !== '' && normalized !== '-' && normalized !== 'SEM RESULTADO' && normalized !== 'SEM DADOS';
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const TempConsulta = () => {
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);

  const key = useMemo(() => extractShareKey(search), [search]);
  const sharedPayload = shareData?.payload;
  const sharedResult = sharedPayload?.result_data || null;

  const badges = useMemo(() => {
    if (!sharedResult) return [] as Array<{ label: string; count: number }>;

    return [
      { label: 'Fotos', count: Number(sharedResult?.foto ? 1 : 0) + Number(sharedResult?.foto2 ? 1 : 0) },
      { label: 'Score', count: hasValue(sharedResult?.score) ? 1 : 0 },
      { label: 'CSB8', count: hasValue(sharedResult?.csb8) || hasValue(sharedResult?.csb8_faixa) ? 1 : 0 },
      { label: 'CSBA', count: hasValue(sharedResult?.csba) || hasValue(sharedResult?.csba_faixa) ? 1 : 0 },
      { label: 'Dados Financeiros', count: [sharedResult?.renda, sharedResult?.fx_poder_aquisitivo, sharedResult?.poder_aquisitivo].some(hasValue) ? 1 : 0 },
      { label: 'Dados Básicos', count: [sharedResult?.nome, sharedResult?.cpf, sharedResult?.data_nascimento].some(hasValue) ? 1 : 0 },
      { label: 'Telefones', count: hasValue(sharedResult?.telefone) ? 1 : 0 },
      { label: 'Emails', count: hasValue(sharedResult?.email) ? 1 : 0 },
      { label: 'Endereços', count: [sharedResult?.logradouro, sharedResult?.cidade, sharedResult?.uf].some(hasValue) ? 1 : 0 },
      { label: 'Título de Eleitor', count: [sharedResult?.titulo_eleitor, sharedResult?.zona, sharedResult?.secao].some(hasValue) ? 1 : 0 },
      { label: 'CNS', count: hasValue(sharedResult?.cns) ? 1 : 0 },
      { label: 'PIS', count: hasValue(sharedResult?.pis) ? 1 : 0 },
    ].filter((badge) => badge.count > 0);
  }, [sharedResult]);

  useEffect(() => {
    const load = async () => {
      if (!key) {
        setError('Chave de compartilhamento inválida.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await tempConsultationShareService.getPublicShareByKey(key);
        setShareData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar a consulta.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key]);

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false} className="flex flex-col min-h-screen">
      <MenuSuperior />

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Carregando dados da consulta...</p>
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card>
              <CardContent className="p-4">
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && sharedPayload && (
            <div className="space-y-6">
              <Card className="border-success-border w-full overflow-hidden">
                <CardHeader className="bg-success-subtle p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center text-success-subtle-foreground min-w-0">
                      <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="truncate text-base sm:text-lg">Sucesso</span>
                    </CardTitle>
                    <span className="inline-flex items-center gap-1 text-xs md:text-sm text-success-subtle-foreground">
                      <Clock3 className="h-4 w-4" />
                      Expira em: {new Date(shareData.expires_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span key={badge.label} className="relative inline-flex">
                        <Badge variant="secondary" className="bg-success text-success-foreground hover:bg-success/80 text-xs">
                          {badge.label}
                        </Badge>
                        <span
                          className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                          aria-label={`Quantidade de registros: ${badge.count}`}
                        >
                          {badge.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {sharedResult?.id && sharedResult?.cpf && (
                <div id="fotos-section">
                  <FotosSection cpfId={Number(sharedResult.id)} cpfNumber={String(sharedResult.cpf)} />
                </div>
              )}

              {(hasValue(sharedResult?.score) || hasValue(sharedResult?.csb8) || hasValue(sharedResult?.csba)) && (
                <section className="mx-auto w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {hasValue(sharedResult?.score) && (
                    <Card id="score-section" className="border-success-border bg-success-subtle">
                      <CardContent className="p-2">
                        <ScoreGaugeCard title="SCORE" score={sharedResult.score} faixa="" icon="chart" compact embedded />
                      </CardContent>
                    </Card>
                  )}
                  {hasValue(sharedResult?.csb8) && (
                    <Card id="csb8-section" className="border-success-border bg-success-subtle">
                      <CardContent className="p-2">
                        <ScoreGaugeCard title="CSB8 [SCORE]" score={sharedResult.csb8} faixa={sharedResult.csb8_faixa} icon="chart" compact embedded />
                      </CardContent>
                    </Card>
                  )}
                  {hasValue(sharedResult?.csba) && (
                    <Card id="csba-section" className="border-success-border bg-success-subtle">
                      <CardContent className="p-2">
                        <ScoreGaugeCard title="CSBA [SCORE]" score={sharedResult.csba} faixa={sharedResult.csba_faixa} icon="chart" compact embedded />
                      </CardContent>
                    </Card>
                  )}
                </section>
              )}

              {sharedResult ? (
                <>
                  <CpfResultDisplay data={sharedResult} loading={false} showExportButton={false} />
                  {sharedResult?.receita_federal && (
                    <ReceitaFederalDisplay data={sharedResult.receita_federal} loading={false} />
                  )}
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <FileText className="h-5 w-5" />
                      Consulta compartilhada (temporária)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap break-words rounded-md border bg-card p-4 text-xs md:text-sm leading-relaxed">
                      {sharedPayload?.report_text || 'Sem dados para exibir.'}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>
      </main>

      <FuturisticFooter />
    </PageLayout>
  );
};

export default TempConsulta;

