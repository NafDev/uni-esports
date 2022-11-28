import type { TeamDto } from '@uni-esports/interfaces';
import supertest from 'supertest';
import he from 'he';
import mailhog from './scripts/mailhog';
import { createNewSession, createNewVerifiedUser } from './common';

const apiTeams = supertest('http://localhost:3000/teams');
const apiUsers = supertest('http://localhost:3000/users');

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

		const [, authCookiesCaptainTest2] = await createNewSession({
			email: 'captain-test-2@brunel.ac.uk',
			password: 'Password10'
		});

		let requestBody: any = { teamName: 'test-team-2' };
		let resp = await apiTeams.post('/create').set('Cookie', authCookiesCaptainTest2).send(requestBody);

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
		resp = await apiTeams.post(`/${teamId}/invite`).set('Cookie', authCookiesCaptainTest2).send(requestBody);
		expect(resp.statusCode).toBe(201);

		requestBody = { invitedPlayer: 'playerTest2' };
		resp = await apiTeams.post(`/${teamId}/invite`).set('Cookie', authCookiesCaptainTest2).send(requestBody);
		expect(resp.statusCode).toBe(201);

		const invite1 = await mailhog.latestTo('player-test-1@brunel.ac.uk');
		expect(invite1?.subject).toBe('Invite to join team test-team-2');

		const invite2 = await mailhog.latestTo('player-test-2@brunel.ac.uk');
		expect(invite2?.subject).toBe('Invite to join team test-team-2');

		// Should be the same token but I'll parse them separately as a sanity check
		let rawHtml = he.decode(invite1?.html ?? '');
		const inviteToken1 = /(?<=\/teams\/join\?code=)\w{10}/.exec(rawHtml)?.at(0);
		rawHtml = he.decode(invite2?.html ?? '');
		const inviteToken2 = /(?<=\/teams\/join\?code=)\w{10}/.exec(rawHtml)?.at(0);

		const [, authCookiesPlayerTest1] = await createNewSession({
			email: 'player-test-1@brunel.ac.uk',
			password: 'Password10'
		});
		const [, authCookiesPlayerTest2] = await createNewSession({
			email: 'player-test-2@brunel.ac.uk',
			password: 'Password10'
		});

		resp = await apiTeams
			.patch(`/join?token=${inviteToken1 ?? ''}`)
			.set('Cookie', authCookiesPlayerTest1)
			.send();
		expect(resp.statusCode).toBe(200);

		resp = await apiTeams
			.patch(`/join?token=${inviteToken2 ?? ''}`)
			.set('Cookie', authCookiesPlayerTest2)
			.send();
		expect(resp.statusCode).toBe(200);

		resp = await apiTeams.get(`/${teamId}`).set('Cookie', authCookiesCaptainTest2).send(requestBody);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: 'test-team-2',
				university: 'Brunel University Uxbridge'
			})
		);
		expect(resp.body.members.length).toBe(3);
	});

	test('Captain invites and removes player from team', async () => {
		await createNewVerifiedUser({
			email: 'captain-test-3@brunel.ac.uk',
			password: 'Password10',
			username: 'captain-test-3'
		});

		const [, authCookiesCaptainTest3] = await createNewSession({
			email: 'captain-test-3@brunel.ac.uk',
			password: 'Password10'
		});

		let requestBody: any = { teamName: 'test-team-3' };
		let resp = await apiTeams.post('/create').set('Cookie', authCookiesCaptainTest3).send(requestBody);
		expect(resp.statusCode).toBe(201);

		const teamId: number = resp.body.id;

		await createNewVerifiedUser({
			email: 'player-test-3@brunel.ac.uk',
			password: 'Password10',
			username: 'playerTest3'
		});

		requestBody = { invitedPlayer: 'player-test-3@brunel.ac.uk' };
		resp = await apiTeams.post(`/${teamId}/invite`).set('Cookie', authCookiesCaptainTest3).send(requestBody);
		expect(resp.statusCode).toBe(201);

		const teamInviteEmail = await mailhog.latestTo('player-test-3@brunel.ac.uk');
		expect(teamInviteEmail?.subject).toBe('Invite to join team test-team-3');
		const rawHtml = he.decode(teamInviteEmail?.html ?? '');
		const inviteToken = /(?<=\/teams\/join\?code=)\w{10}/.exec(rawHtml)?.at(0);

		const [, authCookiesPlayerTest3] = await createNewSession({
			email: 'player-test-3@brunel.ac.uk',
			password: 'Password10'
		});
		resp = await apiUsers.get('/me').set('Cookie', authCookiesPlayerTest3).send();
		const playerUserId: string = resp.body.id;

		resp = await apiTeams
			.patch(`/join?token=${inviteToken ?? ''}`)
			.set('Cookie', authCookiesPlayerTest3)
			.send();
		expect(resp.statusCode).toBe(200);

		resp = await apiTeams
			.patch(`/${teamId}/users/${playerUserId}/remove`)
			.set('Cookie', authCookiesCaptainTest3)
			.send();
		expect(resp.statusCode).toBe(200);

		resp = await apiTeams.get(`/${teamId}`).set('Cookie', authCookiesCaptainTest3).send(requestBody);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: 'test-team-3',
				university: 'Brunel University Uxbridge'
			})
		);
		expect(resp.body.members.length).toBe(1);
	});
});
