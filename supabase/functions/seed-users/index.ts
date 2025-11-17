import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Profile {
  user_id: string;
  user_type: 'youth' | 'senior';
  full_name: string;
  age: number;
  bio: string;
}

interface Asset {
  profile_id: string;
  category_id: null;
  description: string;
}

interface Need {
  profile_id: string;
  category_id: null;
  description: string;
}

const youthNames = [
  '김민준', '이서연', '박지우', '최하은', '정예준',
  '강소율', '조윤서', '윤도현', '장서진'
];

const seniorNames = [
  '김영희', '이철수', '박순자', '최경희', '정명자', '강인숙'
];

const youthAssets = [
  '스마트폰 사용법 알려드려요',
  '컴퓨터 기초부터 가르쳐드립니다',
  '인터넷 쇼핑 도와드려요',
  '카카오톡, 유튜브 사용법 알려드립니다',
  '사진 찍기와 편집 가르쳐드려요',
  '병원 예약, 온라인 뱅킹 도와드립니다',
  '건강 관리 앱 사용법 알려드려요',
  '영상통화 설정 도와드립니다'
];

const youthNeeds = [
  '인생 경험담 듣고 싶어요',
  '요리 레시피 배우고 싶습니다',
  '뜨개질, 바느질 배우고 싶어요',
  '옛날 이야기 듣고 싶습니다',
  '전통 음식 만드는 법 배우고 싶어요',
  '살아온 이야기 경청하고 싶습니다'
];

const seniorAssets = [
  '요리 가르쳐드릴 수 있어요',
  '뜨개질 알려드립니다',
  '바느질, 수선 가르쳐드려요',
  '김치 담그는 법 알려드립니다',
  '전통 음식 만드는 법 가르쳐드려요',
  '텃밭 가꾸기 알려드릴게요',
  '인생 조언 해드릴 수 있어요',
  '손주 돌보는 노하우 공유할게요'
];

const seniorNeeds = [
  '스마트폰 사용법 배우고 싶어요',
  '카카오톡 하는 법 알고 싶습니다',
  '유튜브 보는 법 배우고 싶어요',
  '사진 찍는 법 알고 싶습니다',
  '인터넷 쇼핑 도움 필요해요',
  '병원 예약하는 법 배우고 싶어요',
  '영상통화 하는 법 알려주세요',
  '지도 앱 사용법 배우고 싶습니다'
];

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const profiles: Profile[] = [];
    const allAssets: Asset[] = [];
    const allNeeds: Need[] = [];

    // Create 9 youth profiles
    for (let i = 0; i < 9; i++) {
      const userId = crypto.randomUUID();
      const profile: Profile = {
        user_id: userId,
        user_type: 'youth',
        full_name: youthNames[i],
        age: 20 + Math.floor(Math.random() * 15),
        bio: `안녕하세요! ${youthNames[i]}입니다. 어르신들과 소통하며 도움을 드리고 싶어요.`
      };
      profiles.push(profile);
    }

    // Create 6 senior profiles
    for (let i = 0; i < 6; i++) {
      const userId = crypto.randomUUID();
      const profile: Profile = {
        user_id: userId,
        user_type: 'senior',
        full_name: seniorNames[i],
        age: 65 + Math.floor(Math.random() * 20),
        bio: `${seniorNames[i]}입니다. 젊은 친구들과 이야기 나누고 싶어요.`
      };
      profiles.push(profile);
    }

    // Insert profiles
    const { data: insertedProfiles, error: profileError } = await supabase
      .from('profiles')
      .insert(profiles)
      .select();

    if (profileError) throw profileError;

    // Create assets and needs for each profile
    for (const profile of insertedProfiles!) {
      const isYouth = profile.user_type === 'youth';
      const assetPool = isYouth ? youthAssets : seniorAssets;
      const needPool = isYouth ? youthNeeds : seniorNeeds;

      const numAssets = 2 + Math.floor(Math.random() * 3); // 2-4 assets
      const numNeeds = 2 + Math.floor(Math.random() * 3); // 2-4 needs

      const selectedAssets = getRandomItems(assetPool, numAssets);
      const selectedNeeds = getRandomItems(needPool, numNeeds);

      selectedAssets.forEach(desc => {
        allAssets.push({
          profile_id: profile.id,
          category_id: null,
          description: desc
        });
      });

      selectedNeeds.forEach(desc => {
        allNeeds.push({
          profile_id: profile.id,
          category_id: null,
          description: desc
        });
      });
    }

    // Insert assets
    const { error: assetsError } = await supabase
      .from('profile_assets')
      .insert(allAssets);

    if (assetsError) throw assetsError;

    // Insert needs
    const { error: needsError } = await supabase
      .from('profile_needs')
      .insert(allNeeds);

    if (needsError) throw needsError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `15명의 사용자 프로필과 ${allAssets.length}개의 나눌것, ${allNeeds.length}개의 배울것이 생성되었습니다.`,
        profiles: insertedProfiles.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
