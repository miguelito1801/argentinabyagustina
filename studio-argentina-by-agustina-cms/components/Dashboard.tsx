import React from 'react'
import {Box, Button, Card, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {useClient} from 'sanity'

const apiVersion = '2025-01-01'

type Stats = {
  articles: number
  places: number
  events: number
  pending: number
  approved: number
  drafts: number
}

const emptyStats: Stats = {
  articles: 0,
  places: 0,
  events: 0,
  pending: 0,
  approved: 0,
  drafts: 0,
}

function StatCard({
  label,
  value,
  help,
  warning,
  tone,
  accent,
  icon,
  onClick,
}: {
  label: string
  value: number
  help: string
  warning?: boolean
  tone?: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
  accent: string
  icon: string
  onClick?: () => void
}) {
  return (
    <Card
      padding={4}
      radius={4}
      shadow={1}
      tone={warning ? 'caution' : tone || 'default'}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 142,
        borderTop: `5px solid ${accent}`,
        transition: 'transform .18s ease, box-shadow .18s ease',
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Stack space={3}>
          <Text size={1} weight="semibold" muted>
            {label}
          </Text>
          <Heading size={4}>{value}</Heading>
          <Text size={1} muted style={{lineHeight: 1.45}}>
            {help}
          </Text>
        </Stack>
        <Box
          style={{
            width: 42,
            height: 42,
            minWidth: 42,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: `${accent}18`,
            color: accent,
            fontSize: 21,
          }}
        >
          {icon}
        </Box>
      </Flex>
    </Card>
  )
}

function GuideCard({number, title, text}: {number: string; title: string; text: string}) {
  return (
    <Card padding={4} radius={3} border>
      <Flex gap={3} align="flex-start">
        <Box
          style={{
            width: 32,
            height: 32,
            minWidth: 32,
            borderRadius: 999,
            display: 'grid',
            placeItems: 'center',
            background: '#8b2f32',
            color: '#fffaf2',
            fontWeight: 700,
          }}
        >
          {number}
        </Box>
        <Stack space={2}>
          <Text weight="semibold">{title}</Text>
          <Text size={1} muted style={{lineHeight: 1.5}}>
            {text}
          </Text>
        </Stack>
      </Flex>
    </Card>
  )
}

export function Dashboard() {
  const client = useClient({apiVersion})
  const [stats, setStats] = React.useState<Stats>(emptyStats)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null)
  const [helpTopic, setHelpTopic] = React.useState<'publicar' | 'review' | 'contacto' | 'borrador'>('publicar')

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const base = React.useMemo(() => window.location.pathname.replace(/\/inicio\/?$/, ''), [])

  const go = React.useCallback(
    (path: string) => {
      const url = `${window.location.origin}${base}/contenido/${path}`
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    [base],
  )

  const loadStats = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await client.fetch<Stats>(`{
        "articles": count(*[_type == "article" && !(_id in path("drafts.**"))]),
        "places": count(*[_type == "place" && active != false && !(_id in path("drafts.**"))]),
        "events": count(*[_type == "event" && !(_id in path("drafts.**"))]),
        "pending": count(*[_type == "review" && status == "pending"]),
        "approved": count(*[_type == "review" && status == "approved" && !(_id in path("drafts.**"))]),
        "drafts": count(*[_id in path("drafts.**")])
      }`)
      setStats(result)
      setUpdatedAt(new Date())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [client])

  React.useEffect(() => {
    void loadStats()
    const timer = window.setInterval(() => void loadStats(), 30000)
    return () => window.clearInterval(timer)
  }, [loadStats])

  return (
    <Box padding={[3, 4, 5]} style={{minHeight: '100%', background: '#f7efe2'}}>
      <Stack space={5} style={{maxWidth: 1120, margin: '0 auto'}}>
        <Card
          padding={[4, 5]}
          radius={4}
          shadow={2}
          style={{
            background: 'linear-gradient(135deg, #17384a 0%, #244f62 62%, #6f3033 145%)',
            color: '#fffaf2',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: 999,
              right: -85,
              top: -120,
              border: '1px solid rgba(216,173,85,.28)',
            }}
          />
          <Flex gap={5} align="center" justify="space-between" wrap="wrap" style={{position: 'relative'}}>
            <Stack space={4} style={{flex: '1 1 620px'}}>
              <Text size={1} weight="bold" style={{letterSpacing: '0.16em', color: '#e2bc69'}}>
                ARGENTINA BY AGUSTINA
              </Text>
              <Heading size={4} style={{color: '#fffaf2'}}>
                {greeting}, Agustina ♡
              </Heading>
              <Text size={2} style={{lineHeight: 1.65, color: '#f4eadc', maxWidth: 700}}>
                Este es tu espacio para publicar guías, lugares, eventos y reseñas de forma simple.
                Todo queda guardado para que puedas trabajar tranquila y a tu ritmo.
              </Text>
              <Flex gap={3} align="center" wrap="wrap">
                <Button
                  text="Ver página pública ↗"
                  tone="primary"
                  onClick={() => window.open('https://www.argentinabyagustina.com', '_blank', 'noopener,noreferrer')}
                />
                <Text size={1} style={{color: '#dce8ec'}}>
                  ● Sitio online
                </Text>
              </Flex>
              <Text size={1} style={{color: '#e2bc69'}}>
                Hecho con cariño para tu proyecto — Miguel
              </Text>
            </Stack>

            <Card
              radius={4}
              shadow={2}
              padding={0}
              style={{
                background: 'linear-gradient(145deg, #d5ad55 0%, #f8e9bd 28%, #9d6d2d 100%)',
                border: '1px solid rgba(244,208,122,.85)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: 286,
                justifySelf: 'end',
                boxShadow: '0 18px 42px rgba(9,24,32,.34)',
              }}
            >
              <Box padding={2}>
                <Box
                  style={{
                    background: '#f8edd3',
                    border: '2px solid #7a2e2e',
                    borderRadius: 16,
                    padding: 8,
                    boxShadow: 'inset 0 0 0 3px #d5ad55, inset 0 0 18px rgba(122,46,46,.13)',
                  }}
                >
                  <Stack space={3}>
                    <Box
                      paddingTop={2}
                      style={{
                        borderBottom: '1px solid rgba(157,109,45,.45)',
                        paddingBottom: 9,
                      }}
                    >
                      <Text
                        size={2}
                        weight="bold"
                        align="center"
                        style={{
                          fontFamily: 'Georgia, serif',
                          color: '#7a2e2e',
                          letterSpacing: '.04em',
                        }}
                      >
                        Hacelo por ella ♡
                      </Text>
                    </Box>
                    <Box
                      style={{
                        padding: 5,
                        borderRadius: 15,
                        background: 'linear-gradient(145deg, #9b6a2d, #f2d487 46%, #7a2e2e)',
                        boxShadow: '0 8px 22px rgba(61,38,19,.28)',
                      }}
                    >
                      <img
                        src="/static/indi.jpeg"
                        alt="Indi, la perrita de Agustina"
                        style={{
                          width: '100%',
                          height: 232,
                          objectFit: 'cover',
                          objectPosition: 'center 35%',
                          borderRadius: 11,
                          display: 'block',
                        }}
                      />
                    </Box>
                    <Stack space={2} style={{paddingBottom: 5}}>
                      <Text
                        size={2}
                        weight="bold"
                        align="center"
                        style={{fontFamily: 'Georgia, serif', color: '#17384a'}}
                      >
                        Indi 🐾
                      </Text>
                      <Text
                        size={1}
                        align="center"
                        style={{fontFamily: 'Georgia, serif', color: '#6d5540', fontStyle: 'italic'}}
                      >
                        Una amiga muy querida que siempre inspira.
                      </Text>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Card>
          </Flex>
        </Card>

        {stats.pending > 0 && (
          <Card padding={[4, 5]} radius={4} shadow={1} tone="caution">
            <Flex gap={4} align="center" justify="space-between" wrap="wrap">
              <Stack space={2}>
                <Heading size={2}>
                  Tenés {stats.pending} {stats.pending === 1 ? 'reseña esperando' : 'reseñas esperando'}
                </Heading>
                <Text size={1}>
                  Revisalas con calma. Solo se mostrarán en la web cuando las marques como aprobadas
                  y pulses Publicar.
                </Text>
              </Stack>
              <Button text="Revisar reseñas pendientes" tone="caution" onClick={() => go('pendingReviews')} />
            </Flex>
          </Card>
        )}

        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Stack space={2}>
            <Heading size={2}>Resumen de tu sitio</Heading>
            <Text size={1} muted>
              {updatedAt
                ? `Actualizado a las ${updatedAt.toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'})}`
                : 'Consultando la información del sitio...'}
            </Text>
          </Stack>
          <Button text="Actualizar contadores" mode="ghost" onClick={() => void loadStats()} disabled={loading} />
        </Flex>

        {loading ? (
          <Card padding={5} radius={3}>
            <Flex align="center" justify="center" gap={3}>
              <Spinner muted />
              <Text muted>Cargando el resumen...</Text>
            </Flex>
          </Card>
        ) : error ? (
          <Card padding={4} radius={3} tone="critical">
            <Stack space={3}>
              <Text weight="semibold">No pudimos actualizar los contadores.</Text>
              <Text size={1}>El contenido sigue seguro. Probá nuevamente en unos segundos.</Text>
              <Box>
                <Button text="Volver a intentar" tone="critical" onClick={() => void loadStats()} />
              </Box>
            </Stack>
          </Card>
        ) : (
          <Grid columns={[1, 2, 3]} gap={3}>
            <StatCard label="Guías publicadas" value={stats.articles} help="Guías visibles en la web" tone="positive" accent="#71835b" icon="✦" onClick={() => go('articles')} />
            <StatCard label="Lugares visibles" value={stats.places} help="Recomendaciones publicadas" tone="primary" accent="#52758c" icon="⌖" onClick={() => go('places')} />
            <StatCard label="Eventos publicados" value={stats.events} help="Actividades cargadas" tone="primary" accent="#b17b45" icon="◷" onClick={() => go('events')} />
            <StatCard
              label="Reseñas pendientes"
              value={stats.pending}
              help={stats.pending > 0 ? 'Necesitan tu aprobación' : 'No hay reseñas por revisar'}
              warning={stats.pending > 0}
              accent="#b58b3d"
              icon="!"
              onClick={() => go('pendingReviews')}
            />
            <StatCard label="Reseñas aprobadas" value={stats.approved} help="Opiniones públicas" tone="positive" accent="#71835b" icon="♡" onClick={() => go('approvedReviews')} />
            <StatCard label="Borradores" value={stats.drafts} help="Cambios todavía no publicados" tone={stats.drafts > 0 ? 'caution' : 'default'} accent="#8b6c84" icon="✎" />
          </Grid>
        )}

        {!loading && !error && stats.articles === 0 && (
          <Card padding={[4, 5]} radius={4} tone="primary" shadow={1}>
            <Stack space={3}>
              <Heading size={2}>Tu primera publicación está a un paso</Heading>
              <Text size={1}>Creá una guía breve, agregá una imagen y pulsá Publicar. Después aparecerá automáticamente en la web.</Text>
              <Box>
                <Button text="Crear mi primera guía" tone="primary" onClick={() => go('articles')} />
              </Box>
            </Stack>
          </Card>
        )}

        {!loading && !error && stats.articles > 0 && stats.places > 0 && stats.events > 0 && (
          <Card padding={4} radius={3} tone="positive">
            <Text weight="semibold">¡Excelente! Tu sitio ya tiene artículos, lugares y eventos publicados.</Text>
          </Card>
        )}

        <Card padding={[4, 5]} radius={4} shadow={1} style={{background: '#fffdf8'}}>
          <Stack space={4}>
            <Stack space={2}>
              <Heading size={2}>¿Qué querés hacer hoy?</Heading>
              <Text muted>Los accesos más usados están primero para que encuentres todo rápido.</Text>
            </Stack>
            <Grid columns={[1, 2, 4]} gap={3}>
              <Button text="✦ Escribir una guía" tone="primary" padding={4} onClick={() => go('articles')} />
              <Button text="⌖ Agregar un lugar" mode="ghost" padding={4} onClick={() => go('places')} />
              <Button text="◷ Agregar un evento" mode="ghost" padding={4} onClick={() => go('events')} />
              <Button text="♡ Revisar reseñas" mode="ghost" padding={4} onClick={() => go('pendingReviews')} />
            </Grid>
            <Flex gap={2} wrap="wrap">
              <Button text="Datos de contacto" mode="bleed" onClick={() => go('websiteSettings')} />
              <Button
                text="Manual de ayuda"
                mode="bleed"
                onClick={() => window.open('https://www.argentinabyagustina.com/GUIA-AGUSTINA.html', '_blank', 'noopener,noreferrer')}
              />
              <Button
                text="Abrir página pública ↗"
                mode="bleed"
                onClick={() => window.open('https://www.argentinabyagustina.com', '_blank', 'noopener,noreferrer')}
              />
            </Flex>
          </Stack>
        </Card>

        <Card padding={[4, 5]} radius={4} shadow={1} style={{background: '#fffaf6'}}>
          <Stack space={4}>
            <Stack space={2}>
              <Text size={1} weight="bold" style={{color: '#8b2f32', letterSpacing: '0.08em'}}>
                AYUDITA RÁPIDA
              </Text>
              <Heading size={2}>Agus, ¿qué necesitás hacer?</Heading>
              <Text muted>Elegí una opción y el panel te recuerda los pasos, sin palabras técnicas.</Text>
            </Stack>
            <Flex gap={2} wrap="wrap">
              <Button text="Publicar algo" tone={helpTopic === 'publicar' ? 'primary' : 'default'} mode={helpTopic === 'publicar' ? 'default' : 'ghost'} onClick={() => setHelpTopic('publicar')} />
              <Button text="Aprobar una reseña" tone={helpTopic === 'review' ? 'primary' : 'default'} mode={helpTopic === 'review' ? 'default' : 'ghost'} onClick={() => setHelpTopic('review')} />
              <Button text="Cambiar contacto" tone={helpTopic === 'contacto' ? 'primary' : 'default'} mode={helpTopic === 'contacto' ? 'default' : 'ghost'} onClick={() => setHelpTopic('contacto')} />
              <Button text="Entender borradores" tone={helpTopic === 'borrador' ? 'primary' : 'default'} mode={helpTopic === 'borrador' ? 'default' : 'ghost'} onClick={() => setHelpTopic('borrador')} />
            </Flex>
            <Card padding={4} radius={3} tone="primary">
              {helpTopic === 'publicar' && <Text>Elegí Guías de viaje, Lugares o Eventos → pulsá + → completá los campos → revisá → pulsá Publicar.</Text>}
              {helpTopic === 'review' && <Text>Entrá en Reseñas pendientes → leé el comentario → elegí Aprobada o Rechazada → pulsá Publicar.</Text>}
              {helpTopic === 'contacto' && <Text>Entrá en Datos de contacto → cambiá email, WhatsApp o Instagram → pulsá Publicar.</Text>}
              {helpTopic === 'borrador' && <Text>Borrador no se ve públicamente. Publicado sí. Si aparecen ambos, pulsá Publicar para actualizar la web.</Text>}
            </Card>
          </Stack>
        </Card>

        <Stack space={3}>
          <Heading size={2}>Guía rápida</Heading>
          <Grid columns={[1, 2]} gap={3}>
            <GuideCard
              number="1"
              title="Crear contenido"
              text="Entrá en Guías de viaje, Lugares o Eventos y pulsá el botón +. Completá los campos marcados como obligatorios."
            />
            <GuideCard
              number="2"
              title="Publicar"
              text="Mientras escribís, Sanity guarda un borrador automáticamente. Pulsá Publicar cuando quieras que aparezca en la web."
            />
            <GuideCard
              number="3"
              title="Aprobar una reseña"
              text="Abrí Reseñas pendientes, leé la opinión, elegí Aprobada y después pulsá Publicar."
            />
            <GuideCard
              number="4"
              title="Corregir o quitar contenido"
              text="Abrí el elemento, realizá el cambio y publicalo. Para quitarlo de la web, usá la opción Despublicar."
            />
          </Grid>
        </Stack>

        <Card padding={[4, 5]} radius={4} style={{background: '#edf3ef'}}>
          <Stack space={3}>
            <Heading size={2}>Borrador y Publicado: la diferencia importante</Heading>
            <Text size={1} style={{lineHeight: 1.6}}>
              <strong>Borrador</strong> significa que el cambio está guardado, pero todavía no se ve públicamente.
              <br />
              <strong>Publicado</strong> significa que el contenido ya puede aparecer en la página.
              <br />
              Si ves las dos etiquetas al mismo tiempo, hiciste cambios sobre algo que ya estaba publicado:
              pulsá Publicar para actualizar la versión pública.
            </Text>
          </Stack>
        </Card>

        <Card padding={4} radius={3} tone="positive">
          <Text size={1}>
            Tranquila: todo lo que hagas queda guardado. Podés volver, corregir y publicar cuando estés lista.
          </Text>
        </Card>

        <Box paddingY={3}>
          <Text size={1} muted align="center">
            Argentina by Agustina CMS · Versión 1.2 · Diseñado y desarrollado por Miguel Torres ♡
          </Text>
        </Box>
      </Stack>
    </Box>
  )
}
