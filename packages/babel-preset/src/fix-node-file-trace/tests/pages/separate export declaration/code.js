export const getServerSideProps = async () => {
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
};

function Page({ products }) {
  return JSON.stringify(products);
}

export default Page;
