import { withFixNodeFileTrace as _withFixNodeFileTrace } from 'next/dist/server/utils';

function HealthCheck(_req, res) {
  res.status(200).send('ok');
}

export default _withFixNodeFileTrace(HealthCheck);
