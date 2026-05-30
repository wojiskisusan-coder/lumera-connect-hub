export type User = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  verified?: boolean;
};

export type Post = {
  id: string;
  author: User;
  content: string;
  media?: { kind: "image" | "video"; gradient: string };
  createdAt: string;
  reactions: Record<ReactionKind, number>;
  myReaction?: ReactionKind;
  comments: Comment[];
};

export type ReactionKind = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export type Comment = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  replies?: Comment[];
};

export type Message = {
  id: string;
  from: string;
  text: string;
  at: string;
  read?: boolean;
};

export type Conversation = {
  id: string;
  user: User;
  messages: Message[];
  online?: boolean;
};

export type Notification = {
  id: string;
  kind: "like" | "comment" | "follow" | "message" | "call";
  user: User;
  text: string;
  at: string;
  unread?: boolean;
};

const av = (seed: string) =>
  `https://api.dicebear.com/9.x/glass/svg?seed=${seed}&backgroundType=gradientLinear`;

export const me: User = {
  id: "me",
  username: "you",
  name: "You",
  avatar: av("you-lumera"),
  bio: "Building on Lumera ✨",
};

export const users: User[] = [
  { id: "u1", username: "ava.kim", name: "Ava Kim", avatar: av("ava"), bio: "Designer · Seoul → NYC", verified: true },
  { id: "u2", username: "marco", name: "Marco Reyes", avatar: av("marco"), bio: "Coffee, code, climbing." },
  { id: "u3", username: "ines.l", name: "Inès Laurent", avatar: av("ines"), bio: "Filmmaker. 35mm only.", verified: true },
  { id: "u4", username: "dev.atlas", name: "Atlas Dev", avatar: av("atlas"), bio: "Open source maintainer." },
  { id: "u5", username: "luna", name: "Luna Park", avatar: av("luna"), bio: "DJ · producer · 4am person" },
  { id: "u6", username: "kenji", name: "Kenji Watanabe", avatar: av("kenji"), bio: "Tokyo · architecture nerd" },
];

const grad = (a: string, b: string, c?: string) =>
  `linear-gradient(135deg, ${a} 0%, ${b} 50%${c ? `, ${c} 100%` : ""})`;

export const posts: Post[] = [
  {
    id: "p1",
    author: users[0],
    content: "Shipped the new design system today. 47 components, one consistent voice. Feels good.",
    media: { kind: "image", gradient: grad("#0fb5a8", "#7c3aed", "#f97316") },
    createdAt: "2h",
    reactions: { like: 124, love: 56, haha: 3, wow: 12, sad: 0, angry: 0 },
    myReaction: "love",
    comments: [
      {
        id: "c1",
        author: users[1],
        content: "The motion polish on the dropdowns is *chef's kiss*",
        createdAt: "1h",
        replies: [
          { id: "c1r1", author: users[0], content: "thanks marco — took 3 iterations", createdAt: "55m" },
        ],
      },
      { id: "c2", author: users[3], content: "Open sourcing?", createdAt: "40m" },
    ],
  },
  {
    id: "p2",
    author: users[2],
    content: "Shot something on the rooftop tonight. Tokyo skies hit different in November.",
    media: { kind: "image", gradient: grad("#1e293b", "#db2777", "#fbbf24") },
    createdAt: "5h",
    reactions: { like: 412, love: 188, haha: 0, wow: 33, sad: 0, angry: 0 },
    comments: [],
  },
  {
    id: "p3",
    author: users[4],
    content: "new set dropping friday 🎧 who's coming out?",
    createdAt: "8h",
    reactions: { like: 67, love: 12, haha: 4, wow: 1, sad: 0, angry: 0 },
    comments: [
      { id: "c3", author: users[5], content: "RSVP'd 👋", createdAt: "6h" },
    ],
  },
  {
    id: "p4",
    author: users[3],
    content: "Hot take: if your README has more emojis than code samples, your DX has a problem.",
    createdAt: "12h",
    reactions: { like: 891, love: 22, haha: 134, wow: 8, sad: 0, angry: 17 },
    comments: [],
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    user: users[0],
    online: true,
    messages: [
      { id: "m1", from: "u1", text: "did you see the new build?", at: "10:21" },
      { id: "m2", from: "me", text: "yes!! the sidebar feels so much better", at: "10:22" },
      { id: "m3", from: "u1", text: "right? need to push the typography next", at: "10:22" },
      { id: "m4", from: "me", text: "ship it 🚀", at: "10:23", read: true },
    ],
  },
  {
    id: "conv2",
    user: users[1],
    messages: [
      { id: "m5", from: "u2", text: "coffee tomorrow?", at: "Yesterday" },
    ],
  },
  {
    id: "conv3",
    user: users[2],
    online: true,
    messages: [
      { id: "m6", from: "u3", text: "sent you the cut", at: "Mon" },
    ],
  },
  {
    id: "conv4",
    user: users[4],
    messages: [
      { id: "m7", from: "u5", text: "🎵🎵🎵", at: "Sun" },
    ],
  },
];

export const notifications: Notification[] = [
  { id: "n1", kind: "like", user: users[0], text: "loved your post", at: "5m", unread: true },
  { id: "n2", kind: "comment", user: users[1], text: "commented: 'Open sourcing?'", at: "40m", unread: true },
  { id: "n3", kind: "follow", user: users[5], text: "started following you", at: "2h", unread: true },
  { id: "n4", kind: "call", user: users[2], text: "missed video call", at: "Yesterday" },
  { id: "n5", kind: "message", user: users[4], text: "sent you a message", at: "Yesterday" },
];

export const suggested = users.slice(2, 6);