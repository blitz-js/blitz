import { Button, genKey } from "blitz";

export const getServerSideProps = () => {
  genKey();
  return { props: {} };
};

export default function Web() {
  // const client = new QueryClient();

  return (
    <div>
      <h1>Web</h1>
      <Button>hello</Button>
    </div>
  );
}
