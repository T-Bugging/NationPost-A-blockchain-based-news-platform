import { NewsItem } from '../components/NewsCard';

export const mockNewsData: NewsItem[] = [
  {
  id: '1',
  title: '“Article 32 enables every citizen to approach Supreme Court for enforcement of fundamental rights”, says CJI',
  excerpt: 'The Chief Justice said that Article 32 of the Constitution gives every citizen the right to move the Supreme Court for enforcement of fundamental rights.',
  thumbnail: 'https://th-i.thgim.com/public/incoming/4caom7/article70287761.ece/alternates/LANDSCAPE_1200/10215_16_11_2025_17_17_50_1_WHATSAPPIMAGE2025_11_16AT120624PM.JPEG',
  reliabilityScore: 9,
  category: 'geopolitics',
  author: 'Uday Pandey',
  publishedAt: '2024-12-20',
  blockHash: 'b2e4c6a8d1f3a5b7c9e2f4a6b8d1c3e5f7a9b2c4d6e8f1a3b5c7d9e2f4a6b8c1'
},

  {
  id: '2',
  title: 'Dharmendra health update: Veteran actor “doing better than earlier” as he recovers at home after hospitalisation',
  excerpt: 'Veteran actor Dharmendra was discharged from Mumbai’s Breach Candy Hospital a week ago and is now recovering at home. Sources say he is “doing better than earlier.”',
  thumbnail: 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1QKCIG.img?w=768&h=432&m=6&x=572&y=249&s=297&d=297',
  reliabilityScore: 9,
  category: 'entertainment',
  author: 'Vrundita Jamkar',
  publishedAt: '2025-11-20',
  blockHash: 'e4b7c2d9a1f5e8c3b6d4a9f7c1e2b8d5f9a3c7e1b4d6f2c8a7e3b5d1c9f0a2e6'

}
,
  {
  id: '3',
  title: 'Delhi News LIVE Updates | Red Fort blast: NIA makes first arrest, accused Umar Nabi’s close aide nabbed',
  excerpt: 'The National Investigation Agency (NIA) has arrested Amir Rashid Ali, in whose name the car involved in the attack was registered, from Delhi. Investigations revealed that the car-bomb outside the Red Fort used a mixture of ammonium nitrate and TATP. Also, a blast at the Nowgam Police Station in Jammu & Kashmir (where seized explosives were stored) killed nine people. :contentReference[oaicite:3]{index=3}',
  thumbnail: 'https://images.indianexpress.com/2025/11/red-fort-blast-2-3_20251114193330_20251115072800.jpg?w=640',
  reliabilityScore: 10,
  category: 'nearby',
  author: 'Himanshi Kanhere',
  publishedAt: '2025-11-16',
  blockHash: 'c1e8f4b2d6a0c3f9e1b7a5d2c4e6f8b3d9a1f5c7e2b4a6d0f3c8b1e7a5d2f9'
}
,
  {
    id: '4',
    title: 'Boeing blunts flydubai fleet setback with new jet order',
    excerpt: 'DUBAI (Reuters) -Boeing hit back at the Dubai Airshow with a provisional order for 75 of its 737 MAX jets from flydubai on Wednesday, a day after the long-time Boeing customer handed an order for 150 competing A321neo aircraft to its arch-rival Airbus.',
    thumbnail: 'https://static01.nyt.com/images/2023/05/09/multimedia/09BOEING-sub-czjm/09BOEING-sub-czjm-videoSixteenByNine3000.jpg',
    reliabilityScore: 8.6,
    category: 'business',
    author: 'Chirmiri Patil',
    publishedAt: '2025-11-18',
    blockHash: ' e2c5a8f1d7b3e9c4a6d0f2b8c1e7a3d5f9b2c6e0a4d7f3b1c9e5a2f6d0c8b4'
  },
  {
  id: '4',
  title: 'The EU warns that Russia will attack a NATO country in the next two to four years; Putin could test Article 5 before 2030',
  excerpt: 'Intelligence services within the European Union warn that Vladimir Putin and Russia may attempt to attack a NATO member state within two to four years, possibly testing the collective defence clause (Article 5) before 2030. :contentReference[oaicite:3]{index=3}',
  thumbnail: 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1QAjBC.img?w=768&h=512&m=6&x=448&y=138&s=154&d=154',
  reliabilityScore: 8,
  category: 'geopolitics',
  author: 'Aniket Thakur',
  publishedAt: '2025-11-17',
  blockHash: 'f3a7c9e2b6d4a1f8c5e9b2d7a4c1e6f0b9d3a7c5e1f2b8d4c6e0a3f7b1d9e5'
}
,
  {
    id: '6',
    title: 'GTA 6 Has Been Delayed Again: How Does This Impact the Rest of the Industry?',
    excerpt: 'Grand Theft Auto VI has been delayed again, this time to November 19, 2026, and while the fan community is reeling in its own way, the impacts are not limited to just GTA’s eager audience. Grand Theft Auto is a juggernaut, with GTA V having sold 220 million copies to date',
    thumbnail: 'https://indianexpress.com/wp-content/uploads/2023/12/GTA-6-Rockstar-Games.jpg',
    reliabilityScore: 8.4,
    category: 'entertainment',
    author: 'Yash Kanhere',
    publishedAt: '2025-11-05',
    blockHash: 'f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f2a4b6c8d1e3f5a7b9c2d4e6f8a1'
  }
];

// New: fetch list from backend and map to NewsItem[], building full thumbnail URLs.
export async function fetchRemoteNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch('http://localhost:5000/dashboard/list');
    if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error('Unexpected list format');

    return data.map((item: any): NewsItem => {
      // thumbnail value may be an IPFS hash or a full URL; construct full URL when needed
      const rawThumb = item.thumbnail || item.ipfsHash || item.IpfsHash || (item.files && item.files[0] && (item.files[0].ipfsHash || item.files[0].IpfsHash)) || item.metadata_hash || item.block_hash || '';
      const thumbnail = rawThumb
        ? /^https?:\/\//i.test(String(rawThumb))
          ? String(rawThumb)
          : `https://emerald-general-ant-906.mypinata.cloud/ipfs/${String(rawThumb)}`
        : '';

      const excerpt = item.description
        ? (String(item.description).split(' ').slice(0, 20).join(' ') + (String(item.description).split(' ').length > 20 ? '...' : ''))
        : (item.excerpt || '');

      // Map reliability from several possible fields including backend's `reliability`
      const reliabilityScore = ((): number => {
        if (typeof item.verification?.score === 'number') return item.verification.score;
        if (typeof item.reliabilityScore === 'number') return item.reliabilityScore;
        if (typeof item.reliability === 'number') return item.reliability;
        return 5.0;
      })();

      return {
        id: String(item.metadata_hash || item.block_hash || item.id || item._id || ''),
        title: item.title || item.name || '',
        excerpt,
        thumbnail,
        reliabilityScore,
        category: item.category || (item.tags && item.tags[0]) || 'general',
        author: (item.uploaded_by && item.uploaded_by.name) || item.author || 'Unknown',
        publishedAt: item.published_at || item.publishedAt || item.created_at || new Date().toISOString(),
        blockHash: item.block_hash || item.blockHash || undefined
      };
    });
  } catch (err) {
    // On error, warn and return fallback mock data
    // eslint-disable-next-line no-console
    console.warn('fetchRemoteNews failed, returning mock data', err);
    return mockNewsData;
  }
}