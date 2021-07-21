import { useRouter } from 'next/router'
import { useEffect } from 'react';
import useStickyState from '../../lib/useStickyState';
import { getReporting } from '../../lib/web3/token';

function Hero() {
    const router = useRouter();

    const [reporting, setReporting] = useStickyState({
      gamesPlayed: 0,
      organisations: 0,
      moneyRaised: 0,
      ticketsPurchased: 0
    }, "overallReport");

    useEffect(async e=>{
      setReporting(await getReporting());
    }, []);

    return (<div className="flex w-screen bg-cover card h-screen bg-neutral" style={{ "backgroundImage": "url('" + `unsplash-charity-${Math.floor(Math.random() * 5) + 1}.jpeg` + "')" }}>
        <div className="hero min-h-screen bg-neutral bg-opacity-60">
          <div className="flex-col hero-content lg:flex-row-reverse">
            <img src="/social-harmony.png" className="max-w-sm bg-neutral bg-opacity-70 rounded-lg shadow-2xl" />
            <div>
              <h1 className="mb-5 text-5xl font-bold">
                A new way to support a social cause
          </h1>
              <p className="mb-5 text-lg">
                Choose a game, enter the draw, and win while also supporting your favourite social causes
          </p>
              <button className="btn btn-primary" onClick={e=>router.push("/charities/")}>Get Started</button>
            </div>
          </div>
        </div>
        <div className="flex px-8 mx-8 py-8 justify-center w-screen absolute bottom-0">

          <div className="stats shadow object-bottom p5" style={{ zIndex: "1000" }}>
            <div className="stat bg-neutral bg-opacity-70">
              <div className="stat-title">Charities</div>
              <div className="stat-value">{reporting.organisations}</div>
            </div>
            <div className="stat bg-neutral bg-opacity-70">
              <div className="stat-title">Total Games Played</div>
              <div className="stat-value">{reporting.gamesPlayed}</div>
            </div>
            <div className="stat bg-neutral bg-opacity-70">
              <div className="stat-title">Total Tickets Bought</div>
              <div className="stat-value">{reporting.ticketsPurchased}</div>
            </div>
            <div className="stat bg-neutral bg-opacity-70">
              <div className="stat-title">Total ONE Donated</div>
              <div className="stat-value">{reporting.moneyRaised}</div>
            </div>
          </div>
        </div>
      </div>);
}

export default Hero;