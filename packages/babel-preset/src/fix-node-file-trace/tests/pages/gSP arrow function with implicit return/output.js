import { withFixNodeFileTrace as _withFixNodeFileTrace } from 'next/dist/server/utils';
export const getStaticProps = _withFixNodeFileTrace(() => ({
  props: {
    today: new Date(),
  },
}));
export default function IndexPage({ today }) {
  return JSON.stringify({
    today,
  });
}
