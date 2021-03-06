import { Anchor, Box, Heading, Paragraph } from 'grommet'

export default function Home() {
  return (
    <Box align="center" margin="large">
      <Heading>Grommet is awesome!</Heading>
      <Paragraph>
        Find out more at{' '}
        <Anchor href="https://v2.grommet.io/">https://v2.grommet.io/</Anchor>
      </Paragraph>
    </Box>
  )
}
