import Aragon from '@aragon/wrapper'

const noop = () => {}

const subscribe = (
  wrapper,
  { onApps, onForwarders, onTransaction, onPermissions },
  { ipfsConf }
) => {
  const { apps, forwarders, transactions, permissions } = wrapper

  const subscriptions = {
    apps: apps.subscribe(onApps),
    connectedApp: null,
    forwarders: forwarders.subscribe(onForwarders),
    transactions: transactions.subscribe(onTransaction),
    permissions: permissions.subscribe(onPermissions)
  }

  return subscriptions
}

const initWrapper = async (
  dao,
  ensRegistryAddress,
  {
    provider,
    accounts = '',
    walletProvider = null,
    ipfsConf,
    onError = noop,
    onApps = noop,
    onForwarders = noop,
    onTransaction = noop,
    onPermissions = noop,
  } = {}
) => {
  const wrapper = new Aragon(dao, {
    apm: { ensRegistryAddress, ipfs: ipfsConf },
    provider
  })

  try {
    await wrapper.init( accounts || [accounts])
  } catch (err) {
    if (err.message === 'connection not open') {
      onError(
        new NoConnection(
          'The wrapper can not be initialized without a connection'
        )
      )
      return
    }
    throw err
  }

  const subscriptions = subscribe(
    wrapper,
    { onApps, onForwarders, onTransaction, onPermissions },
    { ipfsConf }
  )

  wrapper.cancel = () => {
    Object.values(subscriptions).forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe()
      }
    })
  }

  return wrapper
}

module.exports = initWrapper
