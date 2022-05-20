import { ZERO_ADDRESS, ZERO_HASH } from '../sdk/constants'
import FACTORY from 'contracts/build/Factory.json'
import { StorageState } from 'state/application/reducer'
import { getContractInstance } from 'utils/contract'
import { isValidColor } from 'utils/color'
import { filterTokenLists } from 'utils/list'
import { STORAGE_APP_KEY } from '../constants'

export const getCurrentDomain = (): string => {
  return window.location.hostname || document.location.host || ''
}

const validArray = (arr: any[]) => Array.isArray(arr) && !!arr.length

const defaultSettings = (): StorageState => ({
  admin: '',
  contracts: {},
  factory: '',
  router: '',
  pairHash: '',
  feeRecipient: '',
  protocolFee: undefined,
  totalFee: undefined,
  allFeeToProtocol: undefined,
  possibleProtocolPercent: [],
  totalSwaps: undefined,
  domain: '',
  projectName: '',
  brandColor: '',
  backgroundColorDark: '',
  backgroundColorLight: '',
  textColorDark: '',
  textColorLight: '',
  logo: '',
  background: '',
  tokenListsByChain: {},
  tokenLists: [],
  navigationLinks: [],
  menuLinks: [],
  socialLinks: [],
  addressesOfTokenLists: [],
  disableSourceCopyright: false,
  defaultSwapCurrency: { input: '', output: '' },
})

const parseSettings = (settings: { [k: string]: any }, chainId: number): StorageState => {
  const appSettings = defaultSettings()

  try {
    if (!settings?.[STORAGE_APP_KEY]) {
      settings[STORAGE_APP_KEY] = {}
    }
    if (!settings[STORAGE_APP_KEY]?.contracts) {
      settings[STORAGE_APP_KEY].contracts = {}
    }
    if (!settings[STORAGE_APP_KEY]?.contracts) {
      settings[STORAGE_APP_KEY].tokenLists = {}
    }

    const { definance: parsedSettings } = settings

    const {
      contracts,
      pairHash,
      feeRecipient,
      domain,
      projectName,
      brandColor,
      backgroundColorDark,
      backgroundColorLight,
      textColorDark,
      textColorLight,
      logoUrl,
      backgroundUrl,
      navigationLinks,
      menuLinks,
      socialLinks,
      tokenLists,
      addressesOfTokenLists,
      disableSourceCopyright,
      defaultSwapCurrency,
    } = parsedSettings

    appSettings.contracts = contracts

    if (contracts[chainId]) {
      const { factory, router } = contracts[chainId]

      appSettings.factory = factory
      appSettings.router = router
    }

    if (pairHash !== ZERO_HASH) appSettings.pairHash = pairHash
    if (feeRecipient !== ZERO_ADDRESS) appSettings.feeRecipient = feeRecipient
    if (domain) appSettings.domain = domain
    if (projectName) appSettings.projectName = projectName

    if (isValidColor(brandColor)) appSettings.brandColor = brandColor
    if (isValidColor(backgroundColorDark)) appSettings.backgroundColorDark = backgroundColorDark
    if (isValidColor(backgroundColorLight)) appSettings.backgroundColorLight = backgroundColorLight
    if (isValidColor(textColorDark)) appSettings.textColorDark = textColorDark
    if (isValidColor(textColorLight)) appSettings.textColorLight = textColorLight

    if (backgroundUrl) appSettings.background = backgroundUrl
    if (logoUrl) appSettings.logo = logoUrl
    if (Boolean(disableSourceCopyright)) appSettings.disableSourceCopyright = disableSourceCopyright

    if (validArray(navigationLinks)) appSettings.navigationLinks = navigationLinks
    if (validArray(menuLinks)) appSettings.menuLinks = menuLinks
    if (validArray(socialLinks)) appSettings.socialLinks = socialLinks
    if (validArray(addressesOfTokenLists)) appSettings.addressesOfTokenLists = addressesOfTokenLists

    if (tokenLists && Object.keys(tokenLists).length) {
      appSettings.tokenListsByChain = tokenLists

      if (tokenLists[chainId]) {
        appSettings.tokenLists = filterTokenLists(chainId, tokenLists[chainId])
      }
    }

    if (defaultSwapCurrency) {
      const { input, output } = defaultSwapCurrency

      if (input) appSettings.defaultSwapCurrency.input = input
      if (output) appSettings.defaultSwapCurrency.output = output
    }
  } catch (error) {
    console.group('%c Storage settings', 'color: red')
    console.error(error)
    console.log('source settings: ', settings)
    console.groupEnd()
  }

  return appSettings
}

export const fetchDomainData = async (
  chainId: undefined | number,
  library: any,
  storage: any,
  trigger?: boolean
): Promise<StorageState | null> => {
  let fullData = defaultSettings()

  try {
    const currentDomain = window.location.hostname || document.location.host
    const { data, owner } = await storage.get(currentDomain)

    const settings = parseSettings(data, chainId || 0)
    const { factory } = settings

    fullData = { ...settings, admin: owner }

    if (factory) {
      //@ts-ignore
      const factoryContract = getContractInstance(library, factory, FACTORY.abi)

      const INIT_CODE_PAIR_HASH = await factoryContract.methods.INIT_CODE_PAIR_HASH().call()

      fullData = { ...fullData, pairHash: INIT_CODE_PAIR_HASH }

      try {
        const factoryInfo = await factoryContract.methods.allInfo().call()
        const { protocolFee, feeTo, totalFee, allFeeToProtocol, POSSIBLE_PROTOCOL_PERCENT, totalSwaps } = factoryInfo

        return {
          ...fullData,
          protocolFee,
          feeRecipient: feeTo,
          totalFee,
          allFeeToProtocol,
          possibleProtocolPercent: validArray(POSSIBLE_PROTOCOL_PERCENT) ? POSSIBLE_PROTOCOL_PERCENT.map(Number) : [],
          totalSwaps: totalSwaps || undefined,
        }
      } catch (error) {
        console.group('%c Factory info', 'color: red;')
        console.error(error)
        console.groupEnd()
      }
    }

    return fullData
  } catch (error) {
    console.group('%c Domain data request', 'color: red;')
    console.error(error)
    console.groupEnd()
    return null
  }
}
