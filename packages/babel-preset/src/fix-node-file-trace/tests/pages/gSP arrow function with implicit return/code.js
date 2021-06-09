export const getStaticProps = () => ({
  props: { today: new Date() },
});

export default function IndexPage({ today }) {
  return JSON.stringify({ today });
}
