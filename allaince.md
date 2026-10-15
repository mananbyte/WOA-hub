The key thing to understand is that alliances and ordinary players should not be two competing versions of your platform. They should be two ways of using the same contract marketplace.

Your platform’s goal is to help World of Airports players arrange more connections. Some will want an organized alliance with its own rules, while others will prefer finding contracts independently. You want both groups on the platform because they increase the number of potential requests, offers, and successful matches.

The existing community already has different alliance models: some assign members specific airports, while others let members announce available aircraft and claim opportunities more flexibly. Your platform should support both rather than force every group into one structure. [Flyboys beginner guide](https://forum.worldofairports.com/t/beginner-updated-guide-what-can-i-do-to-make-the-best-out-of-my-time-spent-in-game/26316) · [Flexi Alliance example](https://forum.worldofairports.com/t/flexi-alliance/17724)

## 1. Think of the platform as one marketplace with different access scopes

## World of Airports Contract Hub

One account system · One contract database · One shared matching engine

Open Marketplace

For independent players and anyone seeking connections outside an alliance.

Open to all

Alliance Spaces

Private member requests, shared offers, schedules, and group rules.

Membership-based

Shared contract lifecycle

Create → Discover → Accept → Send the aircraft in-game → Report outcome

These are not separate databases or separate products. They are different ways of finding and organizing contracts.

For example, a player can be a member of an alliance and still use the public marketplace for additional connections—provided that this is permitted by that alliance’s rules. An independent player can use the open marketplace without ever joining a group.

## 2. Give players three ways to participate

The homepage should not force every user to choose permanently between “alliance” and “normal player.” Instead, offer three natural paths.

Path A — Use the open marketplace

The player creates a profile, posts a request, browses offers, accepts a match, and coordinates the flight. No alliance membership is required.

Best for: newcomers, casual players, and players whose existing alliances don't cover every need.

Path B — Join an existing alliance

The player searches a directory of alliances, reviews each group's rules and airport model, applies or requests an invite, and joins once approved. The alliance workspace then becomes available on the same account.

Best for: players who want recurring, organized connections and a community.

Path C — Use both

A player participates in their alliance's internal network and also searches or posts on the open marketplace when they need more connections. Public use follows the alliance's rules, if any apply.

Best for: active players who want reliable group connections plus opportunities across the wider community.

This third path is important. Joining an alliance should add features and relationships to the user's account, not trap them inside a separate product.

## 3. The complete alliance workflow

Here is how I'd design the experience from an alliance leader's point of view through to an actual connection.

### Step 1 — An existing alliance registers its group

An alliance leader clicks Create or Register a Group.

They fill in an alliance profile with:

- Name, description, logo, and community/Discord link.
- Airport model: assigned airport, flexible exchange, or hybrid.
- Preferred aircraft classes, time windows, and activity expectations.
- Membership mode: open join, application approval, invite-only, or member vote.
- Whether its listings stay private to members or can be shared with the open marketplace.

The group receives its own page, such as `/alliances/example-alliance`, and a private workspace.

Important: registration must not require an alliance to abandon its existing Discord server, forum threads, Google Forms, or internal rules. The platform should be useful alongside them.

### Step 2 — Existing members join the workspace

The leader shares a group invite link in their current Discord server or forum thread. A player opens the link, signs in, connects their Discord account if they choose, and requests to join.

The leader or designated moderators approve the application. The platform assigns membership roles such as:

| Role              | What they can do                                                 |
| ----------------- | ---------------------------------------------------------------- |
| Owner             | Configure the group, appoint admins, transfer or close the group |
| Admin / recruiter | Approve members, manage rules, moderate listings                 |
| Member            | Create and claim eligible group listings                         |
| Visitor           | View the public group page and available recruitment information |

This should not force the group to recreate every part of its existing community on your platform. Its current Discord can remain the conversation hub; your site adds structured contract coordination.

### Step 3 — The alliance selects its contract model

This setting changes what members see and how requests get routed.

[Wing by wing - Bugs - Flyboys.Games forum](https://images.openai.com/static-rsc-4/DtCuJnCUnidde9MpYZmFXpuH01P3lk_iLB1zNKT6h06JR1hnHz355uWPG6WCvgv3Z_4bjtAX6QqVtZO9In63txssAMm0tBdxjr-3sM7E5byVpd9beSefYThQuOxFRJkHQH_LcmSqMFxjfFmcYUvlzqLUNRveMxPeEkgAmXFE-u4?purpose=inline)

Model 1: Assigned-airport alliance

Each member is responsible for a particular airport. Members post incoming or outgoing connection needs associated with that airport, and relevant partners are notified. The group can track which airport assignments are covered and where gaps exist.

[PRG runway layout - General discussion - World of Airports forum](https://images.openai.com/static-rsc-4/__oR-SWAqvlcFoOFTdWV1ngLsbMA45prRk_QYxAB3flnnjuzJucbqfjnz9lLUsyKfVuAbIQOmRspz8Li7dVRHEf8WRibjk0bThhKIOmdNWyvdQNBXiMNJQFuz2umFo6Q4lEd2lU8-gAE6vkQGfh5jQvRYG8aGiI_JkR7HncyOeE?purpose=inline)

Model 2: Flexible exchange alliance

Members announce available aircraft or requests without being locked to one assigned airport. Other eligible members claim opportunities, often on a first-come basis, following the alliance's rules.

[About the Connections (mini-tutorial) - Connections & Co - Flyboys.Games forum](https://images.openai.com/static-rsc-4/KPdikSKxjZ_cPy0zZhcoWoWgzSNzSjxagk-1ofGLmi5CyANzmJ9ZP8CAh2_pCllUcJMWeERgsV4MlwABhlx3pM91hlObzkoY-C5lWdTx5CuRBSJj7XUISsfKeI_YymK4t4Wd5bibecLYUr9WjOfwTcj5oIcHjmM1scE2YppaBzM?purpose=inline)

Model 3: Hybrid alliance

Some routes or airports are reserved for designated members, while other offers can be claimed by anyone in the group. The leader configures which rules apply to each listing or airport.

These models reflect the different ways player-run alliances already organize exchanges.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://forum.worldofairports.com\&sz=32)

Flyboys.Games forum

+1



### Step 4 — A member creates a contract request

Suppose an alliance member manages INN and wants aircraft sent to that airport.

They select:

- Alliance: Example Alliance
- Request type: Seeking incoming aircraft
- Destination airport: INN
- Desired classes: C and D
- Availability: When the member can handle the aircraft
- Audience: Alliance members only
- Expiry: A chosen deadline

They can do this on the website or through a Discord bot command, such as `/contract create`.

The request gets a single contract ID in the platform database. It appears in the alliance's request board and can be posted into a configured Discord channel. The Discord message links back to the same request; it does not create a separate record.

### Step 5 — The system routes it to the right audience

For an assigned-airport alliance, the system can notify members who are expected to serve INN. For a flexible alliance, it can notify eligible members who can fulfil the requested connection. Members claim the request according to the group's policy.

The platform prevents duplicate claims by letting only one eligible claimant reserve a single-claim listing at a time.

The group workspace now tracks the request as Open, Claimed, Awaiting in-game action, and eventually Reported complete or Cancelled. This is tracking of coordination—not direct control over flights inside World of Airports.

### Step 6 — The player performs the flight in the game

The accepted member uses World of Airports itself to send the aircraft to the other player's airport. The receiving player handles the aircraft through the game's normal contract process. The platform cannot reliably detect that action automatically unless a legitimate, supported game integration becomes available. The Flyboys player-contract FAQ describes the game-side process.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://forum.worldofairports.com\&sz=32)

Flyboys.Games forum



The two players report the outcome on your platform. A lightweight confirmation and activity history update. For disputes, the system records each party's report and lets a moderator review it rather than claiming it can independently prove what happened in-game.

### Step 7 — The alliance decides whether to share the listing more broadly

This is one of your most valuable features, but it must be opt-in and configurable.

For example, the alliance might set this policy:

> Keep new requests inside the alliance for two hours. If nobody claims a request, offer the requester the option to publish it to the open marketplace.

The platform should not silently expose private group requests to outsiders. Some alliances have strict rules, and some requests contain information that members only intend to share internally.

If the alliance permits cross-posting, the same listing can expand its audience while retaining the same contract ID and status. If the listing is claimed privately, its public version becomes unavailable too.

### Step 8 — The alliance leader sees what is working

The leader dashboard could show active requests, requests without responses, member participation, average claim time, manually reported completions, and airports or classes where supply is scarce.

This gives the platform a reason for alliances to keep using it after their initial discovery. Instead of just being another place to post a request, it becomes their operational dashboard.

## 4. How this increases traffic instead of splitting it

Your concern is valid: if you build two isolated marketplaces, they can compete for the same listings and make each one feel empty. The solution is to separate who can access a listing from where people discover the platform.

Think of it this way:

| Listing type                     | Who can see it?          | Who can claim it?                         |
| -------------------------------- | ------------------------ | ----------------------------------------- |
| Open request                     | Everyone                 | Any eligible player                       |
| Alliance-only request            | Members of that alliance | Eligible alliance members                 |
| Publicly shared alliance request | Everyone                 | Any player permitted by the listing rules |
| Direct invitation                | Invited player(s)        | Only the intended recipient(s)            |

Your main marketplace should contain all open listings plus alliance listings that their owners have chosen to share publicly. Users can filter by airport, aircraft class, region, alliance, or listing source.

The platform therefore has one marketplace, with private areas where needed. Public players can discover alliance pages and publicly shared requests. Alliance members can also find broader connections without leaving the site.

### A practical example

Suppose your platform has 1,000 registered players:

- 300 players join several existing alliances.
- 700 players participate independently.
- Members create 100 alliance-only requests and 200 public requests.
- Some alliance leaders permit unfilled requests to become public after a delay.

The 300 alliance players bring their own networks to your platform. Their private requests help retain those players, while public listings give them and the 700 independent players opportunities to connect. The group pages also give new players a way to discover alliances and apply to join.

These numbers are only an illustration, not a traffic forecast. The underlying growth mechanism is that alliances bring concentrated communities, and the open marketplace lets eligible demand and supply reach beyond individual groups.

## 5. The Discord workflow should serve both types of players

Discord can be the entry point for both the open marketplace and group spaces.

For independent players, commands might include `/contract create`, `/contract find`, and `/contract status`.

For an alliance, an authorized admin configures the relevant server and channel, then members can use the same contract commands with a group context or create requests from the group's web dashboard. The bot posts notifications to configured channels, while permissions determine whether each listing is visible to the whole server, only platform members of the alliance, or everyone on the platform.

One practical limitation: a Discord bot cannot simply join any server on its own. A server administrator must authorize its installation and required permissions. If an existing alliance cannot or does not want to install it, members should still be able to use the platform and share direct links manually. Avoid making installation in the official WoA Discord a requirement for the product to work.

Your Flyboys forum strategy remains complementary: publish an alliance directory, useful onboarding guides, and a launch or feedback thread where permitted. The forum already uses airport tags and structured connection requests, which is a strong reason to make your own airport and listing filters intuitive.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://forum.worldofairports.com\&sz=32)

Flyboys.Games forum

+1



## 6. What I would actually build first with GSD

You do not need to implement every advanced alliance feature before launching. However, because alliance communities are central to your acquisition strategy, the basic group model should be part of the architecture from the start.

## 1

Marketplace foundation

User profiles, listings, search, filters, acceptance, cancellation, expiry, and a consistent status history. Every listing has an audience/scope field.

## 2

Alliance basics

Group profile, invite/application flow, owner/admin/member permissions, group-only listings, and an optional public-sharing policy.

## 3

Discord workflows

Bot commands, listing embeds, configured channel feeds, deep links, and notifications for both open and alliance requests.

## 4

Alliance operating tools

Assigned-airport tracking, flexible claims, member activity summaries, recruitment settings, and unfilled-request escalation to the public marketplace.

The first three stages provide enough to pilot with an existing alliance and independent players together. Build advanced features like member voting, complex alliance rankings, sophisticated matching, and automated recruitment later, based on feedback.

At the data-model level, I would ask GSD to represent this through entities such as `User`, `Group`, `GroupMembership`, `Listing`, and `ListingClaim`. Each listing should have an explicit audience scope, and all website and Discord actions should use the same underlying authorization and contract logic.

## My final recommendation

Make alliances an organizational layer on top of the marketplace—not an alternative marketplace. Allow existing alliances to bring their communities, keep their private workflows where necessary, and optionally share opportunities publicly. Let independent players use the platform immediately, without being forced to join a group.

That way, alliance users give you concentrated adoption and recurring activity, while independent players keep the open network useful and inclusive. Both contribute to one product, one set of reliable records, and one growing community.
