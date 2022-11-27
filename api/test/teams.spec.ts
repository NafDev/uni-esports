import type { TeamDto } from '@uni-esports/interfaces';
import supertest from 'supertest';
import mailhog from './scripts/mailhog';
import { createNewSession, createNewVerifiedUser } from './common';

const apiTeams = supertest('http://localhost:3000/teams');

describe('Team creation', () => {
	test('Create new team', async () => {
		await createNewVerifiedUser({
			email: 'captain-test-1@brunel.ac.uk',
			password: 'Password10',
			username: 'captain-test-1'
		});

		const [, authCookies] = await createNewSession({ email: 'captain-test-1@brunel.ac.uk', password: 'Password10' });

		const requestBody = { teamName: 'test-team-1' };

		let resp = await apiTeams.post('/create').set('Cookie', authCookies).send(requestBody);

		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: expect.stringMatching('test-team-1'),
				university: expect.stringMatching('Brunel University Uxbridge')
			})
		);

		const newTeamResp: TeamDto = resp.body;

		resp = await apiTeams.get(`/${newTeamResp.id}`).set('Cookie', authCookies).send();

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: expect.stringMatching('test-team-1'),
				university: expect.stringMatching('Brunel University Uxbridge')
			})
		);
	});

	test('Captain invites players to team', async () => {
		await createNewVerifiedUser({
			email: 'captain-test-2@brunel.ac.uk',
			password: 'Password10',
			username: 'captain-test-2'
		});

		const [, authCookies] = await createNewSession({ email: 'captain-test-2@brunel.ac.uk', password: 'Password10' });

		let requestBody: any = { teamName: 'test-team-2' };
		let resp = await apiTeams.post('/create').set('Cookie', authCookies).send(requestBody);

		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: 'test-team-2',
				university: 'Brunel University Uxbridge'
			})
		);
		expect(resp.body.members.length).toBe(1);

		const teamId: number = resp.body.id;

		await createNewVerifiedUser({
			email: 'player-test-1@brunel.ac.uk',
			password: 'Password10',
			username: 'playerTest1'
		});

		await createNewVerifiedUser({
			email: 'player-test-2@brunel.ac.uk',
			password: 'Password10',
			username: 'playerTest2'
		});

		requestBody = { invitedPlayer: 'player-test-1@brunel.ac.uk' };
		resp = await apiTeams.post(`/${teamId}/invite`).set('Cookie', authCookies).send(requestBody);

		expect(resp.statusCode).toBe(201);

		requestBody = { invitedPlayer: 'playerTest2' };
		resp = await apiTeams.post(`/${teamId}/invite`).set('Cookie', authCookies).send(requestBody);

		expect(resp.statusCode).toBe(201);

		const invite1 = await mailhog.latestTo('player-test-1@brunel.ac.uk');
		expect(invite1?.subject).toBe('Invite to join team test-team-2');

		const invite2 = await mailhog.latestTo('player-test-2@brunel.ac.uk');
		expect(invite2?.subject).toBe('Invite to join team test-team-2');
	});
});
