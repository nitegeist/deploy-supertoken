import { useState, useEffect } from 'react';
import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { getNetworkContract } from '../utils/getNetworkContract';
import supertoken_factory from '../constants/ABIs/supertoken_factory.json';
import { useContractWrite, usePrepareContractWrite, useNetwork, useToken, useWaitForTransaction } from 'wagmi'
import DeploySupertoken from '../components/forms/DeploySupertoken';
import Success from '../components/forms/Success';
import Fail from '../components/forms/Fail';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { chain, chains } = useNetwork()

  const [contract, setContract] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [erc20TokenAddress, setAddress] = useState<string | undefined>('');
  const [name, setName] = useState<string | undefined>();
  const [symbol, setSymbol] = useState<string | undefined>();
  const [supertoken, setSupertoken] = useState<string>('');
  
  const [transactionStatus, setTransactionStatus] = useState<string>('0');

  const { config } = usePrepareContractWrite({
    address: contract,
    abi: supertoken_factory,
    functionName: 'createERC20Wrapper',
    args: [erc20TokenAddress!, 1, name!, symbol!],
  })

  const { data, write } = useContractWrite({
    ...config,
  });
 
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSettled(data, error) {
      const response = data ? data.logs[4]?.topics : []
      console.log("Settled", response[2])
      const beginIndex = 2;
      const endIndex = 26;
      const supertokenAddress = response[2]
      const S = supertokenAddress!.replace(supertokenAddress!.substring(beginIndex, endIndex), "");
      console.log('Settled', S);
      setSupertoken(S);
  }
  })

  console.log('tx data', data)

  const token = useToken({
    //@ts-ignore
    address: erc20TokenAddress!,
  })

  useEffect(() => {
    console.log('isSuccess', isSuccess);
    if (isSuccess) {
      setTransactionStatus('2')
    }
    console.log('tr', transactionStatus);
  }, [isSuccess])

  useEffect(() => {
    const contractAddress = getNetworkContract(chain?.id!);
    setChainId(chain?.id!);
    setContract(contractAddress);
  }, [chain])

  useEffect(() => {
    if (!token.data) {
      return;
    }
    setName(`Super ${token.data?.name}`);
    setSymbol(`${token.data?.symbol}x`);
  }, [token])


  const deploySupertoken = async () => {
    if (!symbol || !name || !erc20TokenAddress) {
      console.log('Please fill out form');
      return;
    }
    const tx = await write?.();
  }
  

  return (
    <>
      <Head>
        <title>Deploy Supertoken</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>

        {
          transactionStatus === '1' ? 
          <div className={styles.popup_wrapper}>
            <div className={styles.popup}>
              <Fail message=''/>
            </div>
          </div>
          :
          ''
        }

        {
          transactionStatus === '2' ? 
          <div className={styles.popup_wrapper}>
            <div className={styles.popup}>
              <Success message={JSON.stringify(data)} link='' address=''/>
            </div>
          </div>
          :
          ''
        }

        <div className={styles.center}>
          {
            chainId ?
            <>
              <h1
                style={{
                  fontFamily: 'arial',
                  marginBottom: '1em'
                }}
              >Deploy Supertoken</h1>
              <DeploySupertoken
                //@ts-ignore
                tokenAddress={erc20TokenAddress}
                name={name}
                symbol={symbol}
                setToken={setAddress}
                deploySupertoken={deploySupertoken}
                tokenData={token?.data!}
                networkId={chainId}
                isLoading={isLoading}
              />
            </>
            :
            <div className={styles.description}>
              <p>
                Connect Your Wallet to get started.&nbsp;
              </p>
            </div>
          }
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Deploying Supertokens
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn more about Supertokens
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Support <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Contact the community for support
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Instantly deploy your Supertoken.
            </p>
          </a>
        </div>
      </main>
    </>
  )
}
