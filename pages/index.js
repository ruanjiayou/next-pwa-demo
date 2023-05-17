import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'

export default function Home() {
  return (
    <div >
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 >
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <Image src="/icons/16x16.png" width={16} height={16} alt=""/>
        <p >
          Get started by editing <code>pages/index.js</code>
        </p>

        <div >
          <Link href="/rules" >rule</Link>
        </div>
      </main>

    </div>
  )
}
