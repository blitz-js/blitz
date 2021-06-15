import { withFixNodeFileTrace as _withFixNodeFileTrace } from '@blitzjs/core/server';

function HealthCheck(_req, res) {
  res.status(200).send('ok');
}

export default _withFixNodeFileTrace(HealthCheck);
