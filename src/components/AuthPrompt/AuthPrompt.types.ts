interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

interface WindowWithEthereum extends Window {
  ethereum?: EthereumProvider
}

interface AuthPromptProps {
  onAuthenticate: (walletAddress: string, signature: string) => Promise<void>
}

export type { AuthPromptProps, EthereumProvider, WindowWithEthereum }
