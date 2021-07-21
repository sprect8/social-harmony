/**
 * Code to interact with the social harmony token
 */
import { getReportContract, getRegistryContract, getGameContract, getTokenContract } from "./common";
import hmy from "./hmy";
const { fromWei, toWei, Units, numberToHex } = require('@harmony-js/utils');
const { BN, fromBech32, toBech32 } = require('@harmony-js/crypto');
import UserContext from "./userContext";

const getOrganisations = async () => {
    const contractInstance = getRegistryContract();
    // console.log(contractInstance);
    const result = await contractInstance.methods.getOrgs().call();

    const urls = await Promise.all(result.map(async res => {
        const url = await contractInstance.methods.tokenURI(res).call();
        const json = await (await fetch(url)).json();
        json.id = res;
        return Promise.resolve(json);
    }));

    return urls;
}

const getGame = async (game) => {
    const gameObj = await getGameContract(game);
    const url = await gameObj.methods.metadataURI().call();
    const json = await (await fetch(url)).json();
    json.id = game;
    json.organisation = await gameObj.methods.owner().call();
    const cancelled = await gameObj.methods.isGameCancelled().call();
    const complete = await gameObj.methods.isGameComplete().call();
    if (cancelled) {
        json.status = "cancelled";
    }
    else if (complete) {
        json.status = "completed";
    }
    else {
        json.status = "active";
    }
    const Wei = new BN((await gameObj.methods.pricePerRound().call()).toString());
    const expected = fromWei(Wei, Units.one);

    json.entries = (await gameObj.methods.totalParticipants().call()).toString();;
    json.totalParticipants = (await gameObj.methods.participants().call()).toString();
    json.costPerEntry = expected;
    json.totalEndorsers = (await gameObj.methods.requiredEndorsers().call()).toString();
    json.currentEndorsers = (await gameObj.methods.endorsements().call()).toString();
    json.endorsed = json.totalEndorsers === json.currentEndorsers;

    return json;
}

const getGames = async () => {
    const contractInstance = getTokenContract();
    const games = await Promise.all((await contractInstance.methods.getGameAddresses().call()).map(async game => {
        const json = getGame(game);
        return Promise.resolve(json);

    }));

    return games;
}

// overall stats for:
// charities, total games played, total tickets purchased, total ONE donated
const getReporting = async () => {
    const contractInstance = await getReportContract();
    const result = await contractInstance.methods["getLatestReport()"]().call();

    // report also consists of total number of organisations
    const orgs = await getOrganisations();
    const games = await getGames();

    console.log(result);

    return {
        gamesPlayed: games.length,
        organisations: orgs.length,
        moneyRaised: fromWei(result.sum, Units.one),
        ticketsPurchased: +result.count
    };
}

const particpatingInGame = async (gameAddress) => {
    const contractInstance = getGameContract(gameAddress);
    const result = await contractInstance.methods.getDeposits(fromBech32(UserContext.user.address)).call(); 
    
    return result;
}

const playGame = async (gameAddress) => {
    const contractInstance = UserContext.user.attachToContract(getGameContract(gameAddress));
    const value = await contractInstance.methods.pricePerRound().call();
    
    const options = {
        gasPrice: 1000000000,
        gasLimit: 1000000,
        value: numberToHex(value)
    };
    const result = await contractInstance.methods.participate().send(options);

    return result;
}

export {
    getGame,
    getGames,
    getOrganisations,
    getReporting,
    particpatingInGame,
    playGame
}
