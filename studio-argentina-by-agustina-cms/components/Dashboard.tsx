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
  onClick,
}: {
  label: string
  value: number
  help: string
  warning?: boolean
  tone?: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
  onClick?: () => void
}) {
  return (
    <Card
      padding={4}
      radius={3}
      shadow={1}
      tone={warning ? 'caution' : tone || 'default'}
      onClick={onClick}
      style={{cursor: onClick ? 'pointer' : 'default', minHeight: 120}}
    >
      <Stack space={3}>
        <Text size={1} weight="semibold" muted>
          {label}
        </Text>
        <Heading size={3}>{value}</Heading>
        <Text size={1} muted>
          {help}
        </Text>
      </Stack>
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
          style={{background: '#17384a', color: '#fffaf2'}}
        >
          <Stack space={4}>
            <Text size={1} weight="bold" style={{letterSpacing: '0.16em', color: '#d8ad55'}}>
              ARGENTINA BY AGUSTINA
            </Text>
            <Heading size={4} style={{color: '#fffaf2'}}>
              {greeting}, Agustina ♡
            </Heading>
            <Text size={2} style={{maxWidth: 820, lineHeight: 1.65, color: '#f4eadc'}}>
              Gracias por confiar en mí para crear este proyecto. Deseo que este sitio te acompañe
              durante muchos años y te ayude a mostrar la Argentina tal como vos la vivís: cercana,
              auténtica y llena de experiencias inolvidables.
            </Text>
            <Text size={1} style={{color: '#d8ad55'}}>
              Con mucho cariño — Miguel
            </Text>
          </Stack>
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
            <StatCard label="Artículos publicados" value={stats.articles} help="Notas visibles en la web" tone="positive" onClick={() => go('articles')} />
            <StatCard label="Lugares visibles" value={stats.places} help="Recomendaciones publicadas" tone="primary" onClick={() => go('places')} />
            <StatCard label="Eventos publicados" value={stats.events} help="Actividades cargadas" tone="primary" onClick={() => go('events')} />
            <StatCard
              label="Reseñas pendientes"
              value={stats.pending}
              help={stats.pending > 0 ? 'Necesitan tu aprobación' : 'No hay reseñas por revisar'}
              warning={stats.pending > 0}
              onClick={() => go('pendingReviews')}
            />
            <StatCard label="Reseñas aprobadas" value={stats.approved} help="Opiniones públicas" tone="positive" onClick={() => go('approvedReviews')} />
            <StatCard label="Borradores" value={stats.drafts} help="Cambios todavía no publicados" tone={stats.drafts > 0 ? 'caution' : 'default'} />
          </Grid>
        )}

        {!loading && !error && stats.articles === 0 && (
          <Card padding={[4, 5]} radius={4} tone="primary" shadow={1}>
            <Stack space={3}>
              <Heading size={2}>Tu primera publicación está a un paso</Heading>
              <Text size={1}>Creá una nota breve, agregá una imagen y pulsá Publicar. Después aparecerá automáticamente en la web.</Text>
              <Box>
                <Button text="Crear mi primer artículo" tone="primary" onClick={() => go('articles')} />
              </Box>
            </Stack>
          </Card>
        )}

        {!loading && !error && stats.articles > 0 && stats.places > 0 && stats.events > 0 && (
          <Card padding={4} radius={3} tone="positive">
            <Text weight="semibold">¡Excelente! Tu sitio ya tiene artículos, lugares y eventos publicados.</Text>
          </Card>
        )}

        <Card padding={[4, 5]} radius={4} shadow={1}>
          <Stack space={4}>
            <Heading size={2}>Accesos rápidos</Heading>
            <Text muted>Elegí qué querés administrar. No necesitás usar Visual Studio ni escribir código.</Text>
            <Flex gap={3} wrap="wrap">
              <Button text="Escribir un artículo" tone="primary" onClick={() => go('articles')} />
              <Button text="Agregar un lugar" mode="ghost" onClick={() => go('places')} />
              <Button text="Agregar un evento" mode="ghost" onClick={() => go('events')} />
              <Button text="Revisar opiniones" mode="ghost" onClick={() => go('pendingReviews')} />
              <Button text="Datos de contacto" mode="ghost" onClick={() => go('websiteSettings')} />
              <Button
                text="Abrir manual de ayuda"
                mode="ghost"
                onClick={() => window.open(`${window.location.origin}${base}/GUIA-AGUSTINA.html`, '_blank', 'noopener,noreferrer')}
              />
              <Button
                text="Ver la página pública"
                mode="ghost"
                onClick={() =>
                  window.open('https://www.argentinabyagustina.com', '_blank', 'noopener,noreferrer')
                }
              />
            </Flex>
          </Stack>
        </Card>

        <Stack space={3}>
          <Heading size={2}>Guía rápida</Heading>
          <Grid columns={[1, 2]} gap={3}>
            <GuideCard
              number="1"
              title="Crear contenido"
              text="Entrá en Artículos, Lugares o Eventos y pulsá el botón +. Completá los campos marcados como obligatorios."
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
            Argentina by Agustina CMS · Versión 1.1 DIAMOND · Desarrollado por Miguel Torres ♡
          </Text>
        </Box>
      </Stack>
    </Box>
  )
}
