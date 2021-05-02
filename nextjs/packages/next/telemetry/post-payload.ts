import retry from 'next/dist/compiled/async-retry'
import fetch from 'node-fetch'
import { EventBatchShape, EventContext, EventMeta } from './storage'

export interface Data {
  context: EventContext
  meta: EventMeta
  events: EventBatchShape[]
}

export function _postPayload(data: Data) {
  let lines = ''

  function writeField(key: string, value: unknown) {
    if (lines[lines.length - 1] !== ' ') {
      lines += ','
    }
    if (value === null || value === undefined) {
      lines += `${key}=false`
    } else if (typeof value === 'object') {
      lines += `${key}="object"`
    } else if (typeof value === 'string') {
      lines += `${key}="${value}"`
    } else {
      lines += `${key}=${value}`
    }
  }

  const { nextVersion: blitzVersion, ...meta } = data.meta

  for (let event of data.events) {
    // New line
    if (lines) {
      lines += '\n'
    }

    // Measurement name
    lines += event.eventName

    // Add tags
    lines += `,blitzVersion="${blitzVersion}"`

    // Separate tags + fields
    lines += ' '

    // Add fields
    // from context
    for (let [key, value] of Object.entries(data.context)) {
      writeField(key, value)
    }
    // from event.fields
    for (let [key, value] of Object.entries(event.fields)) {
      writeField(key, value)
    }
    // from meta
    for (let [key, value] of Object.entries(meta)) {
      writeField(key, value)
    }
  }

  return (
    retry(
      () =>
        fetch(
          `https://us-east-1-1.aws.cloud2.influxdata.com/api/v2/write?org=blitz&bucket=blitzjs`,
          {
            method: 'POST',
            body: lines,
            headers: {
              Authorization:
                'Token T5T163w90SHAQCQWQhTiz9anQZqHsPCLRc8jgEL0CIYqqkuOi9tYq4zIzsKXv0uKqQWqLAn8240M9kAYD1Wbug==',
            },
            timeout: 5000,
          }
        ).then(async (res) => {
          if (!res.ok) {
            const err = new Error(res.statusText)
            ;(err as any).response = res
            throw err
          }
        }),
      { minTimeout: 500, retries: 1, factor: 1 }
    )
      .catch(() => {
        // We swallow errors when telemetry cannot be sent
      })
      // Ensure promise is voided
      .then(
        () => {},
        () => {}
      )
  )
}
