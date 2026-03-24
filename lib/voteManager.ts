interface VoteOption {
  id: string;
  label: string;
  votes: string[]; // 투표한 유저 id 목록 (중복 방지용)
}

interface Vote {
  id: string;
  question: string;
  options: VoteOption[];
  createdBy: string;
  active: boolean; // false면 종료된 투표
}

let currentVote: Vote | null = null;

export const voteManager = {
  create(question: string, options: string[], createdBy: string): Vote {
    currentVote = {
      id: Date.now().toString(),
      question,
      options: options.map((label, i) => ({
        id: i.toString(),
        label,
        votes: [],
      })),
      createdBy,
      active: true,
    };
    return currentVote;
  },

  vote(
    optionId: string,
    userId: string,
  ): { success: boolean; reason?: string } {
    if (!currentVote) return { success: false, reason: "진행 중인 투표 없음" };
    if (!currentVote.active) return { success: false, reason: "종료된 투표" };

    // 중복 투표 방지
    const alreadyVoted = currentVote.options.some((o) =>
      o.votes.includes(userId),
    );
    if (alreadyVoted) return { success: false, reason: "이미 투표함" };

    const option = currentVote.options.find((o) => o.id === optionId);
    if (!option) return { success: false, reason: "없는 옵션" };

    option.votes.push(userId);
    return { success: true };
  },

  end(userId: string): { success: boolean; reason?: string } {
    if (!currentVote) return { success: false, reason: "투표 없음" };
    if (currentVote.createdBy !== userId)
      return { success: false, reason: "권한 없음" };
    currentVote.active = false;
    return { success: true };
  },

  getState(): Vote | null {
    return currentVote;
  },

  getSummary() {
    if (!currentVote) return null;
    return {
      id: currentVote.id,
      question: currentVote.question,
      active: currentVote.active,
      createdBy: currentVote.createdBy,
      options: currentVote.options.map((o) => ({
        id: o.id,
        label: o.label,
        count: o.votes.length,
      })),
    };
  },
};
