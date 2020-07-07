<template>
  <main>
    <div v-if="this.loading">Loading {{ this.username }}...</div>
    <div v-if="this.error">Error: {{ this.error }}</div>
    <div v-else>
      <div>Record: {{ this.wins }}W - {{ this.losses }}L</div>
      <div>Rank: {{ this.rank }}</div>
    </div>
  </main>
</template>

<script>
const RANKS = [
  "Unrated",
  "",
  "Iron I",
  "Iron II",
  "Iron III",
  "Bronze I",
  "Bronze II",
  "Bronze III",
  "Silver I",
  "Silver II",
  "Silver III",
  "Gold I",
  "Gold II",
  "Gold III",
  "Platinum I",
  "Platinum II",
  "Platinum III",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Immortal I",
  "Immortal II",
  "Immortal III",
  "Radiant"
];

export default {
  name: "LiveStats",
  props: {
    username: {
      required: true
    }
  },
  data: function() {
    return {
      start: new Date(),
      winOffset: isNaN(parseInt(this.$route.query.winOffset))
        ? 0
        : parseInt(this.$route.query.winOffset),
      lossOffset: isNaN(parseInt(this.$route.query.lossOffset))
        ? 0
        : parseInt(this.$route.query.lossOffset),
      wins: 0,
      losses: 0,
      rank: "unknown",
      userId: undefined,
      loading: true,
      error: undefined
    };
  },
  methods: {
    usernameException() {
      if (!this.username) {
        this.error = `Add "?username=<blitz.gg username>" to the url`;
      } else {
        this.error = `Check that username is accurate in url`;
      }

      this.loading = false;
    },
    async getUserId() {
      let user;
      try {
        if (!this.username) {
          this.usernameException();
          return;
        }
        const playerRequest = await fetch(
          `https://valorant.iesdev.com/player/${this.username}`
        );
        if (!playerRequest.ok) {
          this.usernameException();
          return;
        }

        user = await playerRequest.json();
      } catch (e) {
        this.usernameException();
        return;
      }

      // on successful profile get
      this.loading = false;
      this.userId = user.id;
      this.rank = RANKS[user.ranks.competitive.tier - 1];
    },
    getUserTeam(match) {
      for (const player of match.players) {
        if (player.subject === this.userId) {
          return player.teamId;
        }
      }
    },
    async getUpdates() {
      console.log("Fetching updates...");
      let matchesJson;

      try {
        if (!this.userId) {
          this.usernameException();
          return;
        }

        const matchesUri = `https://valorant.iesdev.com/matches/${this.userId}`;
        const matchesRequest = await fetch(matchesUri);
        if (!matchesRequest.ok) {
          this.usernameException();
          return;
        }

        matchesJson = await matchesRequest.json();
      } catch (e) {
        this.usernameException();
        return;
      }

      const matches = matchesJson.data;
      const sinceStart = matches.filter(
        match => new Date(match.startedAt) >= this.start
      );

      const wins = sinceStart.reduce((acc, match) => {
        const team1 = match.teams[0];
        const team2 = match.teams[1];
        const userTeam = this.getUserTeam(match);

        if (team1.won && team1.teamId === userTeam) return acc + 1;
        else if (team2.won && team2.teamId === userTeam) return acc + 1;
        else return acc;
      }, 0);
      const losses = sinceStart.length - wins;

      this.wins = this.winOffset + wins;
      this.losses = this.lossOffset + losses;
    }
  },
  async created() {
    await this.getUserId();

    this.getUpdates();
    window.setInterval(this.getUpdates, 4000);
  }
};
</script>
