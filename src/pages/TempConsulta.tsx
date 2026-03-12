import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import FuturisticFooter from '@/components/FuturisticFooter';
import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock3, DollarSign, FileText, User } from 'lucide-react';
import { tempConsultationShareService } from '@/services/tempConsultationShareService';
import type { BaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';
import type { BaseRais } from '@/services/baseRaisService';
import FotosSection from '@/components/dashboard/FotosSection';
import ScoreGaugeCard from '@/components/dashboard/ScoreGaugeCard';
import TelefonesSection from '@/components/dashboard/TelefonesSection';
import EmailsSection from '@/components/dashboard/EmailsSection';
import EnderecosSection from '@/components/dashboard/EnderecosSection';
import ParentesSection from '@/components/dashboard/ParentesSection';
import CertidaoNascimentoSection from '@/components/dashboard/CertidaoNascimentoSection';
import DocumentoSection from '@/components/dashboard/DocumentoSection';
import CnsSection from '@/components/dashboard/CnsSection';
import PisSection from '@/components/dashboard/PisSection';
import VacinaDisplay from '@/components/vacina/VacinaDisplay';
import EmpresasSocioSection from '@/components/dashboard/EmpresasSocioSection';
import CnpjMeiSection from '@/components/dashboard/CnpjMeiSection';
import DividasAtivasSection from '@/components/dashboard/DividasAtivasSection';
import { AuxilioEmergencialSection } from '@/components/dashboard/AuxilioEmergencialSection';
import { RaisSection } from '@/components/dashboard/RaisSection';
import InssSection from '@/components/dashboard/InssSection';
import ClaroSection from '@/components/dashboard/ClaroSection';
import VivoSection from '@/components/dashboard/VivoSection';
import OperadoraTimSection from '@/components/dashboard/OperadoraTimSection';
import OperadoraOiSection from '@/components/dashboard/OperadoraOiSection';
import SenhaEmailSection from '@/components/dashboard/SenhaEmailSection';
import SenhaCpfSection from '@/components/dashboard/SenhaCpfSection';
import BoletimOcorrenciaBoSection from '@/components/dashboard/BoletimOcorrenciaBoSection';
import GestaoSection from '@/components/dashboard/GestaoSection';

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

const parseArrayData = <T = unknown,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatRenda = (value: unknown) => {
  if (!hasValue(value)) return '';
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const stringValue = String(value).trim();
  const numeric = Number(stringValue.replace(/\./g, '').replace(',', '.'));

  if (!Number.isNaN(numeric) && stringValue !== '') {
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return stringValue;
};

const formatDateOnly = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

const TempConsulta = () => {
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);

  const [telefonesCount, setTelefonesCount] = useState(0);
  const [emailsCount, setEmailsCount] = useState(0);
  const [enderecosCount, setEnderecosCount] = useState(0);
  const [parentesCount, setParentesCount] = useState(0);
  const [certidaoNascimentoCount, setCertidaoNascimentoCount] = useState(0);
  const [documentoCount, setDocumentoCount] = useState(0);
  const [cnsCount, setCnsCount] = useState(0);
  const [vacinasCount, setVacinasCount] = useState(0);
  const [empresasSocioCount, setEmpresasSocioCount] = useState(0);
  const [cnpjMeiCount, setCnpjMeiCount] = useState(0);
  const [dividasAtivasCount, setDividasAtivasCount] = useState(0);
  const [inssCount, setInssCount] = useState(0);
  const [claroCount, setClaroCount] = useState(0);
  const [vivoCount, setVivoCount] = useState(0);
  const [timCount, setTimCount] = useState(0);
  const [oiCount, setOiCount] = useState(0);
  const [senhaEmailCount, setSenhaEmailCount] = useState(0);
  const [senhaCpfCount, setSenhaCpfCount] = useState(0);
  const [gestaoCount, setGestaoCount] = useState(0);
  const [boCount, setBoCount] = useState(0);

  const key = useMemo(() => extractShareKey(search), [search]);
  const sharedPayload = shareData?.payload;
  const sharedResult = sharedPayload?.result_data || null;

  const cpfId = Number(sharedResult?.id);
  const hasCpfId = Number.isFinite(cpfId) && cpfId > 0;
  const hasCpfValue = hasValue(sharedResult?.cpf);

  const auxiliosEmergenciais = useMemo(
    () => parseArrayData<BaseAuxilioEmergencial>(sharedResult?.auxilio_emergencial),
    [sharedResult?.auxilio_emergencial]
  );

  const raisData = useMemo(() => parseArrayData<BaseRais>(sharedResult?.rais_historico), [sharedResult?.rais_historico]);

  const scoreData = useMemo(() => {
    const score = Number(sharedResult?.score || 0);
    if (score >= 800) return { label: 'Excelente' };
    if (score >= 600) return { label: 'Bom' };
    if (score >= 400) return { label: 'Regular' };
    return { label: 'Baixo' };
  }, [sharedResult?.score]);

  const hasDadosFinanceiros = useMemo(
    () => [sharedResult?.renda, sharedResult?.fx_poder_aquisitivo, sharedResult?.poder_aquisitivo].some(hasValue),
    [sharedResult]
  );

  const hasDadosBasicos = useMemo(
    () => [
      sharedResult?.cpf,
      sharedResult?.nome,
      sharedResult?.data_nascimento,
      sharedResult?.sexo,
      sharedResult?.mae || sharedResult?.nome_mae,
      sharedResult?.pai || sharedResult?.nome_pai,
      sharedResult?.estado_civil,
      sharedResult?.rg,
      sharedResult?.cbo,
      sharedResult?.orgao_emissor,
      sharedResult?.uf_emissao,
      sharedResult?.data_obito,
      sharedResult?.titulo_eleitor,
    ].some(hasValue),
    [sharedResult]
  );

  const hasTituloEleitor = useMemo(
    () => [sharedResult?.titulo_eleitor, sharedResult?.zona, sharedResult?.secao].some(hasValue),
    [sharedResult]
  );

  const badgeCounts = useMemo(() => {
    const fotosCount = Number(hasValue(sharedResult?.foto)) + Number(hasValue(sharedResult?.foto2));
    const scoreCount = hasValue(sharedResult?.score) ? 1 : 0;
    const csb8Count = hasValue(sharedResult?.csb8) || hasValue(sharedResult?.csb8_faixa) ? 1 : 0;
    const csbaCount = hasValue(sharedResult?.csba) || hasValue(sharedResult?.csba_faixa) ? 1 : 0;
    const dadosFinanceirosCount = hasDadosFinanceiros ? 1 : 0;
    const dadosBasicosCount = hasDadosBasicos ? 1 : 0;
    const tituloEleitorCount = hasTituloEleitor ? 1 : 0;
    const pisCount = hasValue(sharedResult?.pis) ? 1 : 0;

    return {
      '#fotos-section': fotosCount,
      '#score-section': scoreCount,
      '#csb8-section': csb8Count,
      '#csba-section': csbaCount,
      '#dados-financeiros-section': dadosFinanceirosCount,
      '#dados-basicos-section': dadosBasicosCount,
      '#telefones-section': telefonesCount,
      '#emails-section': emailsCount,
      '#enderecos-section': enderecosCount,
      '#titulo-eleitor-section': tituloEleitorCount,
      '#parentes-section': parentesCount,
      '#certidao-nascimento-section': certidaoNascimentoCount,
      '#documento-section': documentoCount,
      '#cns-section': cnsCount,
      '#pis-section': pisCount,
      '#vacinas-section': vacinasCount,
      '#empresas-socio-section': empresasSocioCount,
      '#cnpj-mei-section': cnpjMeiCount,
      '#dividas-ativas-section': dividasAtivasCount,
      '#auxilio-emergencial-section': auxiliosEmergenciais.length,
      '#rais-section': raisData.length,
      '#inss-section': inssCount,
      '#claro-section': claroCount,
      '#vivo-section': vivoCount,
      '#tim-section': timCount,
      '#oi-section': oiCount,
      '#senhas-email-section': senhaEmailCount,
      '#senhas-cpf-section': senhaCpfCount,
      '#gestao-cadastral-section': gestaoCount,
    } as Record<string, number>;
  }, [
    sharedResult,
    hasDadosFinanceiros,
    hasDadosBasicos,
    hasTituloEleitor,
    telefonesCount,
    emailsCount,
    enderecosCount,
    parentesCount,
    certidaoNascimentoCount,
    documentoCount,
    cnsCount,
    vacinasCount,
    empresasSocioCount,
    cnpjMeiCount,
    dividasAtivasCount,
    auxiliosEmergenciais.length,
    raisData.length,
    inssCount,
    claroCount,
    vivoCount,
    timCount,
    oiCount,
    senhaEmailCount,
    senhaCpfCount,
    gestaoCount,
  ]);

  const onlineBadges = useMemo(
    () => [
      { href: '#fotos-section', label: 'Fotos' },
      { href: '#score-section', label: 'Score' },
      { href: '#csb8-section', label: 'CSB8' },
      { href: '#csba-section', label: 'CSBA' },
      { href: '#dados-financeiros-section', label: 'Dados Financeiros' },
      { href: '#dados-basicos-section', label: 'Dados Básicos' },
      { href: '#telefones-section', label: 'Telefones' },
      { href: '#emails-section', label: 'Emails' },
      { href: '#enderecos-section', label: 'Endereços' },
      { href: '#titulo-eleitor-section', label: 'Título de Eleitor' },
      { href: '#parentes-section', label: 'Parentes' },
      { href: '#certidao-nascimento-section', label: 'Certidão de Nascimento' },
      { href: '#documento-section', label: 'Documento' },
      { href: '#cns-section', label: 'CNS' },
      { href: '#pis-section', label: 'PIS' },
      { href: '#vacinas-section', label: 'Vacinas' },
      { href: '#empresas-socio-section', label: 'Empresas Associadas (SÓCIO)' },
      { href: '#cnpj-mei-section', label: 'CNPJ MEI' },
      { href: '#dividas-ativas-section', label: 'Dívidas Ativas (SIDA)' },
      { href: '#auxilio-emergencial-section', label: 'Auxílio Emergencial' },
      { href: '#rais-section', label: 'Rais - Histórico de Emprego' },
      { href: '#inss-section', label: 'INSS' },
      { href: '#claro-section', label: 'Operadora Claro' },
      { href: '#vivo-section', label: 'Operadora Vivo' },
      { href: '#tim-section', label: 'Operadora TIM' },
      { href: '#oi-section', label: 'Operadora OI' },
      { href: '#senhas-email-section', label: 'Senhas de Email' },
      { href: '#senhas-cpf-section', label: 'Senhas de CPF' },
      { href: '#gestao-cadastral-section', label: 'Gestão Cadastral' },
    ],
    []
  );

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
                    {onlineBadges
                      .filter((badge) => (badgeCounts[badge.href] ?? 0) > 0)
                      .map((badge) => {
                        const count = badgeCounts[badge.href] ?? 0;
                        return (
                          <a key={badge.href} href={badge.href} className="no-underline">
                            <span className="relative inline-flex">
                              <Badge variant="secondary" className="bg-success text-success-foreground hover:bg-success/80 text-xs">
                                {badge.label}
                              </Badge>
                              {count > 0 ? (
                                <span
                                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                                  aria-label={`Quantidade de registros: ${count}`}
                                >
                                  {count}
                                </span>
                              ) : null}
                            </span>
                          </a>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {hasCpfId && hasCpfValue ? (
                <>
                  <div id="fotos-section">
                    <FotosSection cpfId={cpfId} cpfNumber={String(sharedResult.cpf)} onCountChange={() => undefined} canManage={false} />
                  </div>

                  {(hasValue(sharedResult?.score) || hasValue(sharedResult?.csb8) || hasValue(sharedResult?.csba)) && (
                    <section className="mx-auto w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {hasValue(sharedResult?.score) && (
                        <Card id="score-section" className="border-success-border bg-success-subtle">
                          <CardContent className="p-2 space-y-1">
                            <ScoreGaugeCard title="SCORE" score={sharedResult.score} faixa={scoreData.label} icon="chart" compact embedded />
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
                            <ScoreGaugeCard title="CSBA [SCORE]" score={sharedResult.csba} faixa={sharedResult.csba_faixa} icon="trending" compact embedded />
                          </CardContent>
                        </Card>
                      )}
                    </section>
                  )}

                  {hasDadosFinanceiros && (
                    <Card id="dados-financeiros-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                            <DollarSign className="h-5 w-5" />
                            Dados Financeiros
                          </CardTitle>
                          <div className="relative inline-flex">
                            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">1</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
                          <div>
                            <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
                            <Input id="poder_aquisitivo" value={sharedResult.poder_aquisitivo || ''} disabled className="uppercase text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="renda">Renda</Label>
                            <Input id="renda" value={formatRenda(sharedResult.renda)} disabled className="text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
                            <Input id="fx_poder_aquisitivo" value={sharedResult.fx_poder_aquisitivo || ''} disabled className="uppercase text-[14px] md:text-sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {hasDadosBasicos && (
                    <Card id="dados-basicos-section" className="border-success-border bg-success-subtle w-full">
                      <CardHeader className="p-4 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                            <User className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Dados Básicos</span>
                          </CardTitle>
                          <div className="relative inline-flex">
                            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">1</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="cpf">CPF</Label>
                            <Input id="cpf" value={sharedResult.cpf ? String(sharedResult.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" value={sharedResult.nome || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="data_nascimento">Data de Nascimento</Label>
                            <Input id="data_nascimento" value={sharedResult.data_nascimento ? formatDateOnly(sharedResult.data_nascimento) : ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          {hasValue(sharedResult?.sexo) && (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="sexo">Sexo</Label>
                              <Input id="sexo" value={String(sharedResult.sexo).toUpperCase()} disabled className="bg-muted text-[14px] md:text-sm" />
                            </div>
                          )}
                          {hasValue(sharedResult?.mae || sharedResult?.nome_mae) && (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="mae">Nome da Mãe</Label>
                              <Input id="mae" value={(sharedResult.mae || sharedResult.nome_mae || '').toUpperCase()} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
                            </div>
                          )}
                          {hasValue(sharedResult?.pai || sharedResult?.nome_pai) && (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="pai">Nome do Pai</Label>
                              <Input id="pai" value={(sharedResult.pai || sharedResult.nome_pai || '').toUpperCase()} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div id="telefones-section" className={telefonesCount === 0 ? 'hidden' : ''}>
                    <TelefonesSection cpfId={cpfId} onCountChange={setTelefonesCount} />
                  </div>

                  <div id="emails-section" className={emailsCount === 0 ? 'hidden' : ''}>
                    <EmailsSection cpfId={cpfId} onCountChange={setEmailsCount} />
                  </div>

                  <div id="enderecos-section" className={enderecosCount === 0 ? 'hidden' : ''}>
                    <EnderecosSection cpfId={cpfId} onCountChange={setEnderecosCount} />
                  </div>

                  {hasTituloEleitor && (
                    <Card id="titulo-eleitor-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                            <FileText className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Título de Eleitor</span>
                          </CardTitle>
                          <div className="relative inline-flex">
                            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">1</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                            <Input id="titulo_eleitor" value={sharedResult.titulo_eleitor || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="zona">Zona</Label>
                            <Input id="zona" value={sharedResult.zona || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="secao">Seção</Label>
                            <Input id="secao" value={sharedResult.secao || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div id="parentes-section" className={parentesCount === 0 ? 'hidden' : ''}>
                    <ParentesSection cpfId={cpfId} onCountChange={setParentesCount} />
                  </div>

                  <div id="certidao-nascimento-section" className={certidaoNascimentoCount === 0 ? 'hidden' : ''}>
                    <CertidaoNascimentoSection cpfId={cpfId} onCountChange={setCertidaoNascimentoCount} />
                  </div>

                  <div id="documento-section" className={documentoCount === 0 ? 'hidden' : ''}>
                    <DocumentoSection cpfId={cpfId} onCountChange={setDocumentoCount} />
                  </div>

                  <div id="cns-section" className={cnsCount === 0 ? 'hidden' : ''}>
                    <CnsSection cpfId={cpfId} onCountChange={setCnsCount} />
                  </div>

                  {(hasValue(sharedResult?.pis)) && (
                    <div id="pis-section">
                      <PisSection pis={sharedResult.pis} />
                    </div>
                  )}

                  <div id="vacinas-section" className={vacinasCount === 0 ? 'hidden' : ''}>
                    <VacinaDisplay cpfId={cpfId} onCountChange={setVacinasCount} />
                  </div>

                  <div id="empresas-socio-section" className={empresasSocioCount === 0 ? 'hidden' : ''}>
                    <EmpresasSocioSection cpfId={cpfId} onCountChange={setEmpresasSocioCount} />
                  </div>

                  <div id="cnpj-mei-section" className={cnpjMeiCount === 0 ? 'hidden' : ''}>
                    <CnpjMeiSection cpfId={cpfId} onCountChange={setCnpjMeiCount} />
                  </div>

                  <div id="dividas-ativas-section" className={dividasAtivasCount === 0 ? 'hidden' : ''}>
                    <DividasAtivasSection cpf={String(cpfId)} onCountChange={setDividasAtivasCount} />
                  </div>

                  {auxiliosEmergenciais.length > 0 && (
                    <div id="auxilio-emergencial-section">
                      <AuxilioEmergencialSection auxilios={auxiliosEmergenciais} />
                    </div>
                  )}

                  {raisData.length > 0 && (
                    <div id="rais-section">
                      <RaisSection data={raisData} isLoading={false} />
                    </div>
                  )}

                  <div id="inss-section" className={inssCount === 0 ? 'hidden' : ''}>
                    <InssSection cpfId={cpfId} onCountChange={setInssCount} />
                  </div>

                  <div id="claro-section" className={claroCount === 0 ? 'hidden' : ''}>
                    <ClaroSection cpfId={cpfId} onCountChange={setClaroCount} />
                  </div>

                  <div id="vivo-section" className={vivoCount === 0 ? 'hidden' : ''}>
                    <VivoSection cpfId={cpfId} onCountChange={setVivoCount} />
                  </div>

                  <div id="tim-section" className={timCount === 0 ? 'hidden' : ''}>
                    <OperadoraTimSection cpfId={cpfId} onCountChange={setTimCount} />
                  </div>

                  <div id="oi-section" className={oiCount === 0 ? 'hidden' : ''}>
                    <OperadoraOiSection cpfId={cpfId} onCountChange={setOiCount} />
                  </div>

                  <div id="senhas-email-section" className={senhaEmailCount === 0 ? 'hidden' : ''}>
                    <SenhaEmailSection cpfId={cpfId} onCountChange={setSenhaEmailCount} />
                  </div>

                  <div id="senhas-cpf-section" className={senhaCpfCount === 0 ? 'hidden' : ''}>
                    <SenhaCpfSection cpfId={cpfId} onCountChange={setSenhaCpfCount} />
                  </div>

                  <div id="boletim-ocorrencia-section" className={boCount === 0 ? 'hidden' : ''}>
                    <BoletimOcorrenciaBoSection cpfId={cpfId} onCountChange={setBoCount} />
                  </div>

                  <div id="gestao-cadastral-section" className={gestaoCount === 0 ? 'hidden' : ''}>
                    <GestaoSection cpfId={cpfId} onCountChange={setGestaoCount} />
                  </div>
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
