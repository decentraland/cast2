import * as React from 'react'
import { act, render } from '@testing-library/react'
import { NotificationProvider, useNotifications } from './NotificationContext'

type ProbeApi = ReturnType<typeof useNotifications>

function Probe({ onReady }: { onReady: (api: ProbeApi) => void }) {
  const api = useNotifications()
  React.useEffect(() => {
    onReady(api)
  })
  return <div data-testid="count">{api.notifications.length}</div>
}

function renderWithProvider() {
  let latest: ProbeApi | null = null
  const result = render(
    <NotificationProvider>
      <Probe
        onReady={api => {
          latest = api
        }}
      />
    </NotificationProvider>
  )
  return {
    ...result,
    get api() {
      if (!latest) throw new Error('Probe never reported its api')
      return latest
    }
  }
}

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts with no notifications', () => {
    const { api } = renderWithProvider()
    expect(api.notifications).toEqual([])
  })

  it('appends a notification when show is called and returns its id', () => {
    const tree = renderWithProvider()
    let id = ''
    act(() => {
      id = tree.api.show('PresentationDownloadFailed', { message: 'private url' })
    })
    expect(typeof id).toBe('string')
    expect(id).not.toBe('')
    expect(tree.api.notifications).toHaveLength(1)
    expect(tree.api.notifications[0]).toMatchObject({
      id,
      variant: 'PresentationDownloadFailed',
      message: 'private url'
    })
  })

  it('assigns unique ids to multiple notifications and stacks them in order', () => {
    const tree = renderWithProvider()
    let firstId = ''
    let secondId = ''
    act(() => {
      firstId = tree.api.show('PresentationDownloadFailed', { message: 'one' })
    })
    act(() => {
      secondId = tree.api.show('VideoPlaybackFailed', { message: 'two' })
    })
    expect(firstId).not.toBe(secondId)
    expect(tree.api.notifications.map(n => n.id)).toEqual([firstId, secondId])
  })

  it('removes a notification when dismiss is called with its id', () => {
    const tree = renderWithProvider()
    let id = ''
    act(() => {
      id = tree.api.show('VideoPlaybackFailed', { message: 'gone soon' })
    })
    expect(tree.api.notifications).toHaveLength(1)
    act(() => {
      tree.api.dismiss(id)
    })
    expect(tree.api.notifications).toHaveLength(0)
  })

  it('auto-dismisses a notification with no action after the default timeout', () => {
    const tree = renderWithProvider()
    act(() => {
      tree.api.show('VideoPlaybackFailed', { message: 'will fade' })
    })
    expect(tree.api.notifications).toHaveLength(1)
    act(() => {
      jest.advanceTimersByTime(6000)
    })
    expect(tree.api.notifications).toHaveLength(0)
  })

  it('does NOT auto-dismiss a notification that carries an action button', () => {
    const tree = renderWithProvider()
    act(() => {
      tree.api.show('VideoPlaybackFailed', {
        message: 'sticky',
        action: { label: 'Retry', onClick: () => {} }
      })
    })
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(tree.api.notifications).toHaveLength(1)
  })

  it('preserves the code and action payload on the stored notification', () => {
    const tree = renderWithProvider()
    const onClick = jest.fn()
    act(() => {
      tree.api.show('VideoPlaybackFailed', {
        message: 'try again',
        code: 'video-timeout',
        action: { label: 'Retry', onClick }
      })
    })
    const stored = tree.api.notifications[0]
    expect(stored.code).toBe('video-timeout')
    expect(stored.action?.label).toBe('Retry')
    stored.action?.onClick()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('throws when useNotifications is called outside the provider', () => {
    const Bare = () => {
      useNotifications()
      return null
    }
    // Suppress React's error log for this expected throw.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bare />)).toThrow(/NotificationProvider/)
    spy.mockRestore()
  })
})
