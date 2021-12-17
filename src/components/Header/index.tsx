import React from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import TempLogo from 'assets/images/templogo.png'
import { useActiveWeb3React } from 'hooks'
import { useProjectInfo } from 'state/application/hooks'
import { useETHBalances } from 'state/wallet/hooks'
import Menu from '../Menu'
import { LightCard } from '../Card'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import networks from 'networks.json'

const HeaderFrame = styled.header`
  width: 100vw;
  margin: 0.8rem auto;
  padding: 0.8rem 1.6rem;
  z-index: 2;
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 60px 1fr 120px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 60px 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  width: auto;
  margin: 0 auto;
  padding: 0.3rem;
  justify-content: center;
  border-radius: 0.8rem;
  box-shadow: rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px,
    rgba(0, 0, 0, 0.01) 0px 24px 32px;
  background-color: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 0;
    margin-left: 4%;
    margin-right: auto;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: fixed;
    bottom: 0;
    padding: .5rem;
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top: 1px solid ${({ theme }) => theme.bg3};
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg2)};
  border-radius: 0.7rem;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.bg3};
  box-shadow: rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px,
    rgba(0, 0, 0, 0.01) 0px 24px 32px;

  :focus {
    border: 1px solid blue;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const NetworkCard = styled(LightCard)`
  border-radius: 0.7rem;
  padding: 8px 12px;
  box-shadow: rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px,
    rgba(0, 0, 0, 0.01) 0px 24px 32px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const Icon = styled.div`
  width: 4rem;
  transition: transform 0.2s ease;
  :hover {
    transform: scale(1.1);
  }
`

const LogoImage = styled.img`
  width: 100%;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 0.9rem;
  width: fit-content;
  padding: 0.3rem 0.6rem;
  font-weight: 500;
  transition: 0.12s;

  &:not(:last-child) {
    margin-right: 0.16rem;
  }

  &.${activeClassName} {
    color: ${({ theme }) => theme.white1};
    background-color: ${({ theme }) => theme.primary2};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${({ theme }) => theme.bg3};
  `};
`

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const { logo: logoUrl } = useProjectInfo()
  const baseCoinBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title href=".">
          <Icon>
            <LogoImage src={logoUrl || TempLogo} alt="logo" />
          </Icon>
        </Title>
      </HeaderRow>

      <HeaderLinks>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
          {t('swap')}
        </StyledNavLink>
        <StyledNavLink
          id={`pool-nav-link`}
          to={'/pool'}
          isActive={(match, { pathname }) =>
            Boolean(match) ||
            pathname.startsWith('/add') ||
            pathname.startsWith('/remove') ||
            pathname.startsWith('/create') ||
            pathname.startsWith('/find')
          }
        >
          {t('pool')}
        </StyledNavLink>
      </HeaderLinks>

      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {/* @ts-ignore */}
            {chainId && networks[chainId]?.name && (
              // @ts-ignore
              <NetworkCard title={networks[chainId].name}>{networks[chainId].name}</NetworkCard>
            )}
          </HideSmall>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && baseCoinBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {t('balance')} {baseCoinBalance?.toSignificant(4)}
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>

        <HeaderElementWrap>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
