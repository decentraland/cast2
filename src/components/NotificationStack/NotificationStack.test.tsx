import * as React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { NotificationProvider, useNotifications } from '../../context/NotificationContext'
import { TranslationProvider } from '../../modules/translation'
import { NotificationStack } from './NotificationStack'

// Helper that lets a test imperatively call `show()` from inside the provider tree.
function Trigger({ onReady }: { onReady: (api: ReturnType<typeof useNotifications>) => void }) {
  const api = useNotifications()
  React.useEffect(() => {
    onReady(api)
  })
  return null
}

function renderStack() {
  let api: ReturnType<typeof useNotifications> | null = null
  const utils = render(
    <TranslationProvider>
      <NotificationProvider>
        <Trigger
          onReady={a => {
            api = a
          }}
        />
        <NotificationStack />
      </NotificationProvider>
    </TranslationProvider>
  )
  return {
    ...utils,
    get api() {
      if (!api) throw new Error('Trigger never reported its api')
      return api
    }
  }
}

describe('NotificationStack', () => {
  it('renders nothing when there are no notifications', () => {
    const { container } = renderStack()
    expect(container.querySelectorAll('[data-testid^="notification-"]')).toHaveLength(0)
  })

  it('renders the i18n title for a PresentationDownloadFailed notification', () => {
    const tree = renderStack()
    act(() => {
      tree.api.show('PresentationDownloadFailed', { message: 'private url' })
    })
    expect(screen.getByText("Couldn't load the presentation")).toBeInTheDocument()
    expect(screen.getByText('private url')).toBeInTheDocument()
  })

  it('renders the i18n title for a VideoPlaybackFailed notification', () => {
    const tree = renderStack()
    act(() => {
      tree.api.show('VideoPlaybackFailed', { message: 'video gone' })
    })
    expect(screen.getByText("Video couldn't play")).toBeInTheDocument()
    expect(screen.getByText('video gone')).toBeInTheDocument()
  })

  it('falls back to the default message when none is provided for PresentationDownloadFailed', () => {
    const tree = renderStack()
    act(() => {
      tree.api.show('PresentationDownloadFailed')
    })
    expect(
      screen.getByText("We couldn't download that URL. Make sure it's publicly accessible and try again.")
    ).toBeInTheDocument()
  })

  it('removes the notification when the close button is clicked', () => {
    const tree = renderStack()
    act(() => {
      tree.api.show('VideoPlaybackFailed', { message: 'closeable' })
    })
    expect(screen.getByText('closeable')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(closeBtn)
    expect(screen.queryByText('closeable')).not.toBeInTheDocument()
  })

  it('renders an action button when one is provided and invokes its onClick', () => {
    const tree = renderStack()
    const onClick = jest.fn()
    act(() => {
      tree.api.show('VideoPlaybackFailed', {
        message: 'retryable',
        action: { label: 'Retry', onClick }
      })
    })
    const retry = screen.getByRole('button', { name: 'Retry' })
    fireEvent.click(retry)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('stacks multiple notifications and renders them in insertion order', () => {
    const tree = renderStack()
    act(() => {
      tree.api.show('PresentationDownloadFailed', { message: 'first' })
    })
    act(() => {
      tree.api.show('VideoPlaybackFailed', { message: 'second' })
    })
    const messages = screen.getAllByTestId('notification-message').map(el => el.textContent)
    expect(messages).toEqual(['first', 'second'])
  })
})
