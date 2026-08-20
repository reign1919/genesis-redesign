export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional check if CRON_SECRET is configured in Vercel
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['authorization'];
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://kcnmvggxqcxlbbfgtrwq.supabase.co';

  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjbm12Z2d4cWN4bGJiZmd0cndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzIzNzUsImV4cCI6MjA5OTcwODM3NX0.x_bDyuRfNqiaBQMbzXIGscQbKYV23paJvEgjgujw55k';

  try {
    const cleanUrl = supabaseUrl.replace(/\/+$/, '');
    const response = await fetch(`${cleanUrl}/rest/v1/events?select=id&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Supabase pinged successfully. Database is active.',
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
