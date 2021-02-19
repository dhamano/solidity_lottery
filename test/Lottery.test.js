const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../compile');

let lottery, accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000', });

    lottery.setProvider(provider);
});

async function enterLottery(account, amount) {
    return await lottery.methods.enter().send({
            from: account,
            value: web3.utils.toWei(`${amount}`, 'ether'),
        });
}

async function pickAWinner(account) {
    return await lottery.methods.pickWinner().send({ from: account });
}

async function getPlayers(account) {
    return await lottery.methods.getPlayers().call({ from: account, });
}

async function loop(f, times) {
    for (let i = 0; i < times; i++) { await f(i) }
}

describe('Lottery Contract', () => {
    it('deploys a contract', async () => { assert.ok(lottery.options.address); });

    it('allows one account to enter', async () => {
        await enterLottery(accounts[0], 0.02);

        const players = await getPlayers(accounts[0]);

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        const numOfPlayers = 3;
        const enterPlayers = async (i) => await enterLottery(accounts[i], 0.02);

        await loop(enterPlayers, numOfPlayers);
        
        const players = await getPlayers(accounts[0]);
        const checkResults = async (i) => assert.strictEqual(accounts[i], players[i]);

        await loop(checkResults, numOfPlayers);
        assert.strictEqual(numOfPlayers, players.length);
    });

    it('recieves ether from entrants', async () => {
        const numOfPlayers = 4,
            amountOfEtherToEnter = 2,
            amountToIncrementBalanceBy = web3.utils.toWei(`${amountOfEtherToEnter}`, 'ether');
        let balanceArr = [],
            currentLotteryBalanceShouldBe = amountToIncrementBalanceBy;

        // loop through numOfPlayers and store new lottery amount after entrances into array
        const afterPlayersEnterLotteryBalance = async (i) => {
            const result = await enterLottery(accounts[i], amountOfEtherToEnter);
            balanceArr[i] = await web3.eth.getBalance(result.to);
        }

        // check stored lottery amounts to see if balance increases by amountOfEtherToEnter between entries
        const checkLotteryBalances = async (i) => {
            assert.strictEqual(currentLotteryBalanceShouldBe, balanceArr[i]);
            currentLotteryBalanceShouldBe = `${parseInt(currentLotteryBalanceShouldBe) + parseInt(amountToIncrementBalanceBy)}`;
        }

        await loop(afterPlayersEnterLotteryBalance, numOfPlayers);
        await loop(checkLotteryBalances, numOfPlayers);
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await enterLottery(accounts[0], 0);
            assert(false);
        } catch (e) {
            assert(e);
        }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await pickAWinner(accounts[1]);
            // await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert(false);
        } catch (e) {
            assert(e);
        }
    });

    it('saves the winning address', async () => {
        try {
            await enterLottery(accounts[1], 1);
            await pickAWinner(accounts[0]);
            // await lottery.methods.pickWinner().send({ from: accounts[0] });
            const winner = await lottery.methods.lastWinner().call();

            assert.strictEqual(accounts[1], winner);
        } catch (e) {
            assert(false);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        const lotteryReciept = await enterLottery(accounts[0], 2);
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        const initialLotteryBalance = await web3.eth.getBalance(lotteryReciept.to);

        await pickAWinner(accounts[0]);
        // await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        const finalLotteryBalance = parseInt(await web3.eth.getBalance(lotteryReciept.to)); // returns value as string so must parse to int
        const players = await getPlayers(accounts[0]);

        assert(difference > web3.utils.toWei('1.8', 'ether'));
        assert.strictEqual(0, players.length);
        assert.strictEqual(initialLotteryBalance, web3.utils.toWei('2', 'ether'));
        assert.strictEqual(0, finalLotteryBalance)
    });
});