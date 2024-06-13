import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Time } from '../wrappers/Time';
import '@ton/test-utils';

describe('Time', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let time: SandboxContract<Time>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        time = blockchain.openContract(await Time.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await time.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: time.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and time are ready to use
    });

    it('should return the correct Unix time', async () => {
        const result = await time.getUnixTime();
        const unixTime = Number(result);
        const currentTime = Math.floor(Date.now() / 1000);
        expect(unixTime).toBeCloseTo(currentTime, 1) // Allow a difference of 1 second
    });

    it('should return the correct string representation of time', async () => {
        const result = await time.getStringTime();
        const currentTime = Math.floor(Date.now() / 1000);
        const expectedString = `${currentTime} seconds have elapsed since January 1, 1970`;
        expect(result).toContain(expectedString);
    });

    it('should wait al least 10 seconds', async () => {
        blockchain.now = (blockchain.now || Math.floor(Date.now() / 1000)) + 11; // Simulate the passing of 11 seconds
        const result = await time.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'wait 10s'
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: time.address,
            success: true
        });
    });

    it('should fail if not waited 10 seconds', async () => {
        const result = await time.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'wait 10s'
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: time.address,
            success: false
        });
    });

    it('should wait al least 10 days', async () => {
        blockchain.now = (blockchain.now || Math.floor(Date.now() / 1000)) + 10 * 24 * 60 * 60 + 1; // Simulate the passing of 10 days and 1 second
        const result = await time.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'wait 10d'
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: time.address,
            success: true
        });
    });

    it('should fail if not waited 10 days', async () => {
        blockchain.now = (blockchain.now || Math.floor(Date.now() / 1000)) + 10 * 24 * 60 * 60 - 1; // Simulate the passing of just under 10 days
        const result = await time.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'wait 10d'
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: time.address,
            success: false
        });
    });

});
