export async function getStaticProps() {
  const products = [
    {
      name: 'Hat',
      publishedAt: new Date(0),
    },
  ];
  return {
    props: {
      products,
    },
  };
}

export default function Page({ products }) {
  return JSON.stringify(products);
}
