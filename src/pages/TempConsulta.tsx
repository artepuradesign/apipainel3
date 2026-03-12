import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import FuturisticFooter from '@/components/FuturisticFooter';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock3, FileText } from 'lucide-react';
import { tempConsultationShareService } from '@/services/tempConsultationShareService';

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

const TempConsulta = () => {
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);

  const key = useMemo(() => extractShareKey(search), [search]);

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
        <section className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <FileText className="h-5 w-5" />
                Consulta compartilhada (temporária)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground">Carregando dados da consulta...</p>
              )}

              {!loading && error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && shareData?.payload && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span><strong>CPF:</strong> {shareData.payload?.cpf || shareData.cpf || 'N/A'}</span>
                    <span><strong>Nome:</strong> {shareData.payload?.nome || 'N/A'}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />Expira em: {new Date(shareData.expires_at).toLocaleString('pt-BR')}</span>
                  </div>

                  <pre className="whitespace-pre-wrap break-words rounded-md border bg-card p-4 text-xs md:text-sm leading-relaxed">
                    {shareData.payload?.report_text || 'Sem dados para exibir.'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <FuturisticFooter />
    </PageLayout>
  );
};

export default TempConsulta;
