'use client'

import React, { useState, useEffect } from 'react'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RiDashboardLine, RiCalendarLine, RiBarChartLine, RiTwitterXLine, RiLinkedinFill, RiInstagramLine, RiFacebookFill, RiTiktokLine, RiSendPlaneLine, RiMailLine, RiTimeLine, RiHashtag, RiArrowRightLine, RiCheckLine, RiCloseLine, RiLoader4Line, RiEyeLine, RiCalendarEventLine, RiLineChartLine, RiStarLine, RiTrophyLine, RiFlashlightLine, RiArrowUpLine, RiArrowDownLine, RiExternalLinkLine } from 'react-icons/ri'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// ---- AGENT IDS ----
const AGENT_CALENDAR = '6998c08344e76e643b8ffc03'
const AGENT_ANALYTICS = '6998c0a7e5ae4890f6e2bf07'
const AGENT_REPORT = '6998c0a8344803d1bba89408'
const AGENT_TWITTER = '6998c0a81b41f953752f2325'

// ---- AGENTS INFO ----
const AGENTS = [
  { id: AGENT_CALENDAR, name: 'Content Calendar Coordinator', purpose: 'Generates multi-platform content calendars with trend research and scheduling', type: 'Manager' },
  { id: AGENT_ANALYTICS, name: 'Performance Analyst', purpose: 'Analyzes engagement metrics and provides recommendations', type: 'Independent' },
  { id: AGENT_REPORT, name: 'Report Delivery', purpose: 'Sends performance reports via email (Gmail)', type: 'Independent' },
  { id: AGENT_TWITTER, name: 'Twitter Publisher', purpose: 'Publishes tweets directly to Twitter/X', type: 'Independent' },
]

// ---- PLATFORM CONFIG ----
const PLATFORMS = [
  { key: 'LinkedIn', icon: RiLinkedinFill, color: '#0A66C2' },
  { key: 'Instagram', icon: RiInstagramLine, color: '#E4405F' },
  { key: 'Twitter/X', icon: RiTwitterXLine, color: '#14171A' },
  { key: 'Facebook', icon: RiFacebookFill, color: '#1877F2' },
  { key: 'TikTok', icon: RiTiktokLine, color: '#000000' },
]

function getPlatformConfig(name: string) {
  const normalized = (name || '').toLowerCase().replace(/\s/g, '')
  if (normalized.includes('linkedin')) return PLATFORMS[0]
  if (normalized.includes('instagram')) return PLATFORMS[1]
  if (normalized.includes('twitter') || normalized === 'x') return PLATFORMS[2]
  if (normalized.includes('facebook')) return PLATFORMS[3]
  if (normalized.includes('tiktok')) return PLATFORMS[4]
  return { key: name, icon: RiHashtag, color: '#666666' }
}

// ---- CHART COLORS ----
const CHART_COLORS = ['hsl(24, 95%, 53%)', 'hsl(12, 80%, 50%)', 'hsl(35, 85%, 55%)', 'hsl(0, 70%, 55%)', 'hsl(45, 90%, 50%)']

// ---- INTERFACES ----
interface PlatformTrend {
  platform: string
  trending_hashtags: string[]
  content_formats: string[]
  optimal_posting_times: string
  engagement_insights: string
}

interface CalendarPost {
  platform: string
  date: string
  time: string
  caption: string
  hashtags: string[]
  cta: string
  content_format: string
}

interface ScheduledEvent {
  event_title: string
  platform: string
  date: string
  time: string
  status: string
  calendar_link: string
}

interface CalendarData {
  calendar_summary: string
  platform_trends: PlatformTrend[]
  posts: CalendarPost[]
  scheduled_events: ScheduledEvent[]
  content_strategy_notes: string
  total_posts: string
  total_events_created: string
}

interface PlatformMetric {
  platform: string
  likes: string
  shares: string
  reach: string
  impressions: string
  engagement_rate: string
  trend: string
}

interface Recommendation {
  priority: string
  action: string
  expected_impact: string
}

interface AnalyticsData {
  summary: string
  top_platform: string
  overall_engagement_rate: string
  platform_metrics: PlatformMetric[]
  recommendations: Recommendation[]
  growth_trend: string
  best_content_type: string
}

interface ReportData {
  delivery_status: string
  recipients: string[]
  subject_line: string
  sent_at: string
  email_preview: string
}

interface TweetData {
  publish_status: string
  tweet_content: string
  character_count: string
  tweet_url: string
  published_at: string
  hashtags_used: string[]
}

interface StatusMessage {
  type: 'success' | 'error'
  text: string
}

// ---- SAMPLE DATA ----
const SAMPLE_CALENDAR: CalendarData = {
  calendar_summary: 'A 7-day content calendar targeting LinkedIn, Instagram, and Twitter/X with a focus on AI and technology innovation. Includes 6 optimized posts with trending hashtags and platform-specific content formats.',
  platform_trends: [
    { platform: 'LinkedIn', trending_hashtags: ['#AIInnovation', '#FutureOfWork', '#TechLeadership'], content_formats: ['Carousel', 'Article', 'Poll'], optimal_posting_times: '8:00 AM - 10:00 AM EST', engagement_insights: 'Professional audiences engage most with data-driven content and thought leadership.' },
    { platform: 'Instagram', trending_hashtags: ['#TechLife', '#Innovation', '#AIArt'], content_formats: ['Reel', 'Story', 'Carousel'], optimal_posting_times: '11:00 AM - 1:00 PM EST', engagement_insights: 'Visual storytelling with behind-the-scenes content drives highest engagement.' },
    { platform: 'Twitter/X', trending_hashtags: ['#AI', '#Tech', '#Innovation'], content_formats: ['Thread', 'Poll', 'Short Take'], optimal_posting_times: '9:00 AM - 11:00 AM EST', engagement_insights: 'Concise insights and hot takes generate the most retweets.' },
  ],
  posts: [
    { platform: 'LinkedIn', date: '2025-02-24', time: '09:00', caption: 'The future of AI is not about replacing humans, but augmenting our capabilities. Here are 5 ways AI is transforming the workplace in 2025...', hashtags: ['#AIInnovation', '#FutureOfWork'], cta: 'What AI tools are you using? Share in the comments!', content_format: 'Carousel' },
    { platform: 'Instagram', date: '2025-02-24', time: '12:00', caption: 'Behind the scenes of our AI lab - where innovation happens every day. Swipe to see the process!', hashtags: ['#TechLife', '#AIArt', '#Innovation'], cta: 'Double tap if you love tech!', content_format: 'Reel' },
    { platform: 'Twitter/X', date: '2025-02-25', time: '10:00', caption: 'Hot take: AI won\'t take your job. But someone who knows how to use AI will. Here\'s why upskilling matters more than ever.', hashtags: ['#AI', '#Tech'], cta: 'Agree or disagree? Quote tweet with your thoughts.', content_format: 'Thread' },
    { platform: 'LinkedIn', date: '2025-02-26', time: '08:30', caption: 'Poll: What\'s the biggest challenge in implementing AI at your organization?', hashtags: ['#TechLeadership', '#AIInnovation'], cta: 'Vote now and let us know!', content_format: 'Poll' },
    { platform: 'Instagram', date: '2025-02-26', time: '11:30', caption: 'Our team just shipped a new feature powered by machine learning. The results? 40% faster processing.', hashtags: ['#Innovation', '#TechLife'], cta: 'Save this for later!', content_format: 'Carousel' },
    { platform: 'Twitter/X', date: '2025-02-27', time: '09:30', caption: 'Thread: 7 AI tools that will change how you work in 2025. Let me break them down...', hashtags: ['#AI', '#Innovation', '#Tech'], cta: 'Bookmark this thread!', content_format: 'Thread' },
  ],
  scheduled_events: [
    { event_title: 'LinkedIn Carousel Post', platform: 'LinkedIn', date: '2025-02-24', time: '09:00', status: 'Scheduled', calendar_link: 'https://calendar.google.com/event/1' },
    { event_title: 'Instagram Reel Post', platform: 'Instagram', date: '2025-02-24', time: '12:00', status: 'Scheduled', calendar_link: 'https://calendar.google.com/event/2' },
    { event_title: 'Twitter Thread', platform: 'Twitter/X', date: '2025-02-25', time: '10:00', status: 'Scheduled', calendar_link: 'https://calendar.google.com/event/3' },
  ],
  content_strategy_notes: 'Focus on thought leadership and data-driven content for LinkedIn. Use visual storytelling for Instagram. Keep Twitter/X content concise and engagement-driven. Monitor trending hashtags weekly and adjust strategy accordingly.',
  total_posts: '6',
  total_events_created: '3',
}

const SAMPLE_ANALYTICS: AnalyticsData = {
  summary: 'Overall social media performance shows strong growth across all platforms. LinkedIn leads in engagement rate while Instagram shows the highest reach growth. Twitter/X maintains steady impressions with room for improvement in shares.',
  top_platform: 'LinkedIn',
  overall_engagement_rate: '4.8%',
  platform_metrics: [
    { platform: 'LinkedIn', likes: '2450', shares: '380', reach: '45000', impressions: '67000', engagement_rate: '5.2%', trend: 'up' },
    { platform: 'Instagram', likes: '5200', shares: '890', reach: '82000', impressions: '120000', engagement_rate: '4.5%', trend: 'up' },
    { platform: 'Twitter/X', likes: '1800', shares: '420', reach: '35000', impressions: '52000', engagement_rate: '3.8%', trend: 'stable' },
    { platform: 'Facebook', likes: '1200', shares: '280', reach: '28000', impressions: '41000', engagement_rate: '3.2%', trend: 'down' },
  ],
  recommendations: [
    { priority: 'High', action: 'Increase video content on Instagram Reels to capitalize on growing reach', expected_impact: '+25% engagement within 30 days' },
    { priority: 'High', action: 'Post LinkedIn articles during peak hours (8-10 AM EST) for maximum visibility', expected_impact: '+15% impressions' },
    { priority: 'Medium', action: 'Implement Twitter/X thread strategy with data visualizations', expected_impact: '+20% retweets and bookmarks' },
    { priority: 'Low', action: 'Test Facebook carousel ads to boost declining engagement', expected_impact: '+10% reach recovery' },
  ],
  growth_trend: 'Positive - 12% month-over-month increase',
  best_content_type: 'Video / Carousel',
}

const SAMPLE_TWEET_CONTENT = 'Exciting developments in AI are reshaping how we work and create. The future is not about replacement, but augmentation. #AI #Innovation #FutureOfWork'

// ---- PARSE HELPER ----
function parseAgentResponse<T>(result: AIAgentResponse): T | null {
  if (!result.success) return null
  let data: unknown = result?.response?.result
  if (!data) return null
  if (typeof data === 'string') {
    try { return JSON.parse(data) as T } catch { return null }
  }
  return data as T
}

// ---- MARKDOWN RENDERER ----
function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

// ---- ERROR BOUNDARY ----
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---- INLINE STATUS ----
function InlineStatus({ message }: { message: StatusMessage | null }) {
  if (!message) return null
  return (
    <div className={`p-4 rounded-xl border text-sm ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      <div className="flex items-center gap-2">
        {message.type === 'success' ? <RiCheckLine className="w-4 h-4 flex-shrink-0" /> : <RiCloseLine className="w-4 h-4 flex-shrink-0" />}
        <span>{message.text}</span>
      </div>
    </div>
  )
}

// ---- METRIC CARD ----
function MetricCard({ icon: Icon, label, value, subtext }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; subtext?: string }) {
  return (
    <div className="bg-card/75 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

// ---- LOADING SPINNER ----
function LoadingSpinner({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <RiLoader4Line className="w-12 h-12 text-primary animate-spin" />
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-500 ${i === currentStep ? 'text-primary font-medium' : i < currentStep ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
            {i < currentStep ? <RiCheckLine className="w-4 h-4 text-green-600" /> : i === currentStep ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- PLATFORM CHIP ----
function PlatformChip({ platformData, selected, onClick }: { platformData: typeof PLATFORMS[0]; selected: boolean; onClick: () => void }) {
  const Icon = platformData.icon
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${selected ? 'bg-primary/10 border-primary/30 text-foreground' : 'bg-card border-border text-muted-foreground hover:border-primary/20'}`}>
      <Icon className="w-4 h-4" style={{ color: selected ? platformData.color : undefined }} />
      <span>{platformData.key}</span>
    </button>
  )
}

// ---- POST CARD ----
function PostCard({ post, onClick }: { post: CalendarPost; onClick?: () => void }) {
  const pConfig = getPlatformConfig(post.platform)
  const PIcon = pConfig.icon
  return (
    <div onClick={onClick} className="bg-card/75 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <PIcon className="w-4 h-4" style={{ color: pConfig.color }} />
          <span className="text-sm font-medium">{post.platform}</span>
        </div>
        <Badge variant="secondary" className="text-xs">{post.content_format || 'Post'}</Badge>
      </div>
      <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-3">{post.caption}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {Array.isArray(post?.hashtags) && post.hashtags.slice(0, 3).map((tag, i) => (
          <span key={i} className="text-xs text-primary font-medium">{tag?.startsWith('#') ? tag : `#${tag}`}</span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <RiCalendarLine className="w-3.5 h-3.5" />
          <span>{post.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <RiTimeLine className="w-3.5 h-3.5" />
          <span>{post.time}</span>
        </div>
      </div>
    </div>
  )
}

// ==================== DASHBOARD SCREEN ====================
function DashboardScreen({ calendarData, analyticsData, setActiveScreen, sampleMode }: {
  calendarData: CalendarData | null
  analyticsData: AnalyticsData | null
  setActiveScreen: (s: string) => void
  sampleMode: boolean
}) {
  const cData = sampleMode ? SAMPLE_CALENDAR : calendarData
  const aData = sampleMode ? SAMPLE_ANALYTICS : analyticsData

  const totalPosts = cData?.total_posts ?? '0'
  const activePlatforms = Array.isArray(cData?.posts) ? [...new Set(cData.posts.map(p => p.platform))].length : 0
  const engRate = aData?.overall_engagement_rate ?? '--'
  const upcomingCount = Array.isArray(cData?.scheduled_events) ? cData.scheduled_events.length : 0
  const recentPosts = Array.isArray(cData?.posts) ? cData.posts.slice(0, 4) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of your social media command center</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={RiCalendarEventLine} label="Posts Scheduled" value={totalPosts} />
        <MetricCard icon={RiHashtag} label="Platforms Active" value={activePlatforms > 0 ? String(activePlatforms) : sampleMode ? '3' : '0'} />
        <MetricCard icon={RiLineChartLine} label="Engagement Rate" value={engRate} />
        <MetricCard icon={RiTimeLine} label="Upcoming Events" value={String(upcomingCount)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming Posts</CardTitle>
            <CardDescription>Your next scheduled content</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post, i) => {
                  const pConf = getPlatformConfig(post.platform)
                  const PIcon = pConf.icon
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                      <PIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: pConf.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{post.caption}</p>
                        <p className="text-xs text-muted-foreground mt-1">{post.date} at {post.time}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{post.content_format}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <RiCalendarLine className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No posts scheduled yet</p>
                <p className="text-xs mt-1">Generate a content calendar to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest updates from your agents</CardDescription>
          </CardHeader>
          <CardContent>
            {(cData || aData) ? (
              <div className="space-y-3">
                {cData && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <RiCalendarEventLine className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Calendar Generated</p>
                      <p className="text-xs text-muted-foreground">{cData.total_posts} posts across {Array.isArray(cData?.platform_trends) ? cData.platform_trends.length : 0} platforms</p>
                    </div>
                  </div>
                )}
                {aData && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <RiBarChartLine className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Performance Analyzed</p>
                      <p className="text-xs text-muted-foreground">Top platform: {aData.top_platform} | Engagement: {aData.overall_engagement_rate}</p>
                    </div>
                  </div>
                )}
                {Array.isArray(cData?.scheduled_events) && cData.scheduled_events.slice(0, 2).map((evt, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <RiCheckLine className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{evt.event_title}</p>
                      <p className="text-xs text-muted-foreground">{evt.status} for {evt.date} at {evt.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <RiFlashlightLine className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Start by generating content or analyzing metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setActiveScreen('calendar')} className="bg-card/75 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-md text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <RiCalendarLine className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Generate Calendar</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">Create a multi-platform content calendar with trend research and scheduling.</p>
          <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
            <span>Get started</span>
            <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button onClick={() => setActiveScreen('analytics')} className="bg-card/75 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-md text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <RiBarChartLine className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Analyze Performance</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">Get insights, recommendations, and growth analysis from your metrics.</p>
          <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
            <span>View analytics</span>
            <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button onClick={() => setActiveScreen('twitter')} className="bg-card/75 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-md text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <RiTwitterXLine className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Post to Twitter</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">Compose and publish tweets directly to your Twitter/X account.</p>
          <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
            <span>Compose tweet</span>
            <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  )
}

// ==================== CALENDAR SCREEN ====================
function CalendarScreen({ calendarData, setCalendarData, setActiveAgentId, sampleMode }: {
  calendarData: CalendarData | null
  setCalendarData: (d: CalendarData | null) => void
  setActiveAgentId: (id: string | null) => void
  sampleMode: boolean
}) {
  const [theme, setTheme] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [frequency, setFrequency] = useState('3x/Week')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [platformFilter, setPlatformFilter] = useState<string>('All')
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null)
  const [showPostDialog, setShowPostDialog] = useState(false)

  const loadingSteps = ['Researching trends...', 'Drafting content...', 'Scheduling events...']

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    if (sampleMode) {
      setTheme('AI and Technology Innovation')
      setSelectedPlatforms(['LinkedIn', 'Instagram', 'Twitter/X'])
      setStartDate('2025-02-24')
      setEndDate('2025-03-02')
      setFrequency('3x/Week')
      setCalendarData(SAMPLE_CALENDAR)
    }
  }, [sampleMode])

  const togglePlatform = (key: string) => {
    setSelectedPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const handleGenerate = async () => {
    if (!theme.trim()) { setStatusMessage({ type: 'error', text: 'Please enter a theme or topic' }); return }
    if (selectedPlatforms.length === 0) { setStatusMessage({ type: 'error', text: 'Please select at least one platform' }); return }
    if (!startDate || !endDate) { setStatusMessage({ type: 'error', text: 'Please set a date range' }); return }

    setLoading(true)
    setStatusMessage(null)
    setLoadingStep(0)
    setActiveAgentId(AGENT_CALENDAR)

    const message = `Generate a social media content calendar with the following specifications:
Theme/Topic: ${theme}
Target Platforms: ${selectedPlatforms.join(', ')}
Date Range: ${startDate} to ${endDate}
Posting Frequency: ${frequency}

Please research current trends for each platform, create platform-optimized posts with captions, hashtags, CTAs, and content format recommendations. Schedule them on Google Calendar.`

    const result = await callAIAgent(message, AGENT_CALENDAR)

    if (result.success) {
      const data = parseAgentResponse<CalendarData>(result)
      if (data) {
        setCalendarData(data)
        setStatusMessage({ type: 'success', text: `Calendar generated with ${data.total_posts || '0'} posts and ${data.total_events_created || '0'} events!` })
      } else {
        setStatusMessage({ type: 'error', text: 'Received unexpected response format' })
      }
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Failed to generate calendar' })
    }

    setActiveAgentId(null)
    setLoading(false)
  }

  const displayData = sampleMode ? SAMPLE_CALENDAR : calendarData
  const posts = Array.isArray(displayData?.posts) ? displayData.posts : []
  const filteredPosts = platformFilter === 'All' ? posts : posts.filter(p => p.platform === platformFilter)
  const uniquePlatforms = ['All', ...Array.from(new Set(posts.map(p => p.platform)))]
  const trends = Array.isArray(displayData?.platform_trends) ? displayData.platform_trends : []
  const events = Array.isArray(displayData?.scheduled_events) ? displayData.scheduled_events : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Content Calendar</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate a multi-platform content calendar powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Campaign Brief</CardTitle>
              <CardDescription>Define your content strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="cal-theme" className="text-sm">Theme / Topic</Label>
                <Input id="cal-theme" placeholder="e.g., AI and Technology Innovation" value={theme} onChange={e => setTheme(e.target.value)} className="mt-1.5" />
              </div>

              <div>
                <Label className="text-sm">Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {PLATFORMS.map(p => (
                    <PlatformChip key={p.key} platformData={p} selected={selectedPlatforms.includes(p.key)} onClick={() => togglePlatform(p.key)} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cal-start" className="text-sm">Start Date</Label>
                  <Input id="cal-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cal-end" className="text-sm">End Date</Label>
                  <Input id="cal-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1.5" />
                </div>
              </div>

              <div>
                <Label className="text-sm">Posting Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="3x/Week">3x / Week</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <InlineStatus message={statusMessage} />

              <Button onClick={handleGenerate} disabled={loading} className="w-full rounded-xl">
                {loading ? <><RiLoader4Line className="w-4 h-4 animate-spin mr-2" />Generating...</> : <><RiCalendarEventLine className="w-4 h-4 mr-2" />Generate Calendar</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {loading ? (
            <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
              <CardContent className="pt-6">
                <LoadingSpinner steps={loadingSteps} currentStep={loadingStep} />
              </CardContent>
            </Card>
          ) : displayData ? (
            <div className="space-y-6">
              {displayData.calendar_summary && (
                <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Calendar Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(displayData.calendar_summary)}</div>
                    <div className="flex gap-4 mt-4">
                      <Badge variant="secondary">{displayData.total_posts ?? '0'} posts</Badge>
                      <Badge variant="secondary">{displayData.total_events_created ?? '0'} events</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {trends.length > 0 && (
                <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Platform Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {trends.map((trend, i) => {
                        const tConf = getPlatformConfig(trend.platform)
                        const TIcon = tConf.icon
                        return (
                          <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-3">
                            <div className="flex items-center gap-2">
                              <TIcon className="w-4 h-4" style={{ color: tConf.color }} />
                              <span className="font-medium text-sm">{trend.platform}</span>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Trending Hashtags</p>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(trend?.trending_hashtags) && trend.trending_hashtags.map((tag, j) => (
                                  <span key={j} className="text-xs text-primary font-medium">{tag}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Best Formats</p>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(trend?.content_formats) && trend.content_formats.map((fmt, j) => (
                                  <Badge key={j} variant="secondary" className="text-xs">{fmt}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Best Posting Time</p>
                              <p className="text-xs">{trend.optimal_posting_times}</p>
                            </div>
                            {trend.engagement_insights && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Insights</p>
                                <p className="text-xs leading-relaxed">{trend.engagement_insights}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {posts.length > 0 && (
                <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="text-lg">Scheduled Posts</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {uniquePlatforms.map(p => (
                          <button key={p} onClick={() => setPlatformFilter(p)} className={`px-2.5 py-1 text-xs rounded-lg transition-all ${platformFilter === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPosts.map((post, i) => (
                        <PostCard key={i} post={post} onClick={() => { setSelectedPost(post); setShowPostDialog(true) }} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {events.length > 0 && (
                <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Calendar Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {events.map((evt, i) => {
                        const eConf = getPlatformConfig(evt.platform)
                        const EIcon = eConf.icon
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="flex items-center gap-3">
                              <EIcon className="w-4 h-4" style={{ color: eConf.color }} />
                              <div>
                                <p className="text-sm font-medium">{evt.event_title}</p>
                                <p className="text-xs text-muted-foreground">{evt.date} at {evt.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{evt.status}</Badge>
                              {evt.calendar_link && (
                                <a href={evt.calendar_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  <RiExternalLinkLine className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {displayData.content_strategy_notes && (
                <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Content Strategy Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(displayData.content_strategy_notes)}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center py-16">
                  <RiCalendarLine className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold mb-2">No Calendar Generated Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">Fill in the campaign brief on the left and click Generate Calendar to create your content calendar.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>Review your scheduled post</DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(() => { const c = getPlatformConfig(selectedPost.platform); const I2 = c.icon; return <I2 className="w-5 h-5" style={{ color: c.color }} /> })()}
                <span className="font-medium">{selectedPost.platform}</span>
                <Badge variant="secondary" className="text-xs">{selectedPost.content_format}</Badge>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Caption</Label>
                <p className="text-sm mt-1 leading-relaxed">{selectedPost.caption}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Hashtags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedPost?.hashtags) && selectedPost.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Call to Action</Label>
                <p className="text-sm mt-1">{selectedPost.cta}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="text-sm mt-1">{selectedPost.date}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Time</Label>
                  <p className="text-sm mt-1">{selectedPost.time}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== ANALYTICS SCREEN ====================
function AnalyticsScreen({ analyticsData, setAnalyticsData, setActiveAgentId, sampleMode }: {
  analyticsData: AnalyticsData | null
  setAnalyticsData: (d: AnalyticsData | null) => void
  setActiveAgentId: (id: string | null) => void
  sampleMode: boolean
}) {
  const [inputMode, setInputMode] = useState<'structured' | 'bulk'>('structured')
  const [bulkInput, setBulkInput] = useState('')
  const [platformInputs, setPlatformInputs] = useState<Record<string, Record<string, string>>>({
    LinkedIn: { likes: '', shares: '', reach: '', impressions: '', clicks: '' },
    Instagram: { likes: '', shares: '', reach: '', impressions: '', clicks: '' },
    'Twitter/X': { likes: '', shares: '', reach: '', impressions: '', clicks: '' },
    Facebook: { likes: '', shares: '', reach: '', impressions: '', clicks: '' },
    TikTok: { likes: '', shares: '', reach: '', impressions: '', clicks: '' },
  })
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportStatus, setReportStatus] = useState<StatusMessage | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [recipientEmails, setRecipientEmails] = useState('')
  const [subjectLine, setSubjectLine] = useState('')

  useEffect(() => {
    if (sampleMode) {
      setPlatformInputs({
        LinkedIn: { likes: '2450', shares: '380', reach: '45000', impressions: '67000', clicks: '1200' },
        Instagram: { likes: '5200', shares: '890', reach: '82000', impressions: '120000', clicks: '3400' },
        'Twitter/X': { likes: '1800', shares: '420', reach: '35000', impressions: '52000', clicks: '980' },
        Facebook: { likes: '1200', shares: '280', reach: '28000', impressions: '41000', clicks: '650' },
        TikTok: { likes: '', shares: '', reach: '', impressions: '', clicks: '' },
      })
      setAnalyticsData(SAMPLE_ANALYTICS)
      setRecipientEmails('team@example.com')
      setSubjectLine('Weekly Social Media Performance Report')
    }
  }, [sampleMode])

  const updatePlatformInput = (platform: string, field: string, value: string) => {
    setPlatformInputs(prev => ({
      ...prev,
      [platform]: { ...(prev[platform] || {}), [field]: value },
    }))
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setStatusMessage(null)
    setActiveAgentId(AGENT_ANALYTICS)

    let message = ''
    if (inputMode === 'bulk') {
      if (!bulkInput.trim()) {
        setStatusMessage({ type: 'error', text: 'Please paste your metrics data' })
        setLoading(false)
        setActiveAgentId(null)
        return
      }
      message = `Analyze the following social media performance data and provide insights, recommendations, and trends:\n\n${bulkInput}`
    } else {
      const platformData = Object.entries(platformInputs)
        .filter(([, vals]) => Object.values(vals).some(v => v.trim() !== ''))
        .map(([platform, vals]) => `${platform}: Likes=${vals.likes || '0'}, Shares=${vals.shares || '0'}, Reach=${vals.reach || '0'}, Impressions=${vals.impressions || '0'}, Clicks=${vals.clicks || '0'}`)
        .join('\n')

      if (!platformData) {
        setStatusMessage({ type: 'error', text: 'Please enter metrics for at least one platform' })
        setLoading(false)
        setActiveAgentId(null)
        return
      }

      message = `Analyze the following social media engagement metrics across platforms and provide a comprehensive performance report with summary, platform comparison, recommendations, and growth trends:

${platformData}

Please include: overall engagement rate, top performing platform, best content type recommendations, priority-ranked action items with expected impact, and growth trend analysis.`
    }

    const result = await callAIAgent(message, AGENT_ANALYTICS)

    if (result.success) {
      const data = parseAgentResponse<AnalyticsData>(result)
      if (data) {
        setAnalyticsData(data)
        setStatusMessage({ type: 'success', text: 'Performance analysis complete!' })
      } else {
        setStatusMessage({ type: 'error', text: 'Received unexpected response format' })
      }
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Failed to analyze performance' })
    }

    setActiveAgentId(null)
    setLoading(false)
  }

  const handleEmailReport = async () => {
    if (!recipientEmails.trim()) { setReportStatus({ type: 'error', text: 'Please enter recipient email(s)' }); return }
    const aData = sampleMode ? SAMPLE_ANALYTICS : analyticsData
    if (!aData) { setReportStatus({ type: 'error', text: 'No analytics data to send. Run analysis first.' }); return }

    setReportLoading(true)
    setReportStatus(null)
    setActiveAgentId(AGENT_REPORT)

    const metricsStr = Array.isArray(aData?.platform_metrics)
      ? aData.platform_metrics.map((m: PlatformMetric) => `${m.platform}: Likes=${m.likes}, Shares=${m.shares}, Reach=${m.reach}, Impressions=${m.impressions}, Engagement Rate=${m.engagement_rate}`).join('\n')
      : 'No metrics available'

    const recsStr = Array.isArray(aData?.recommendations)
      ? aData.recommendations.map((r: Recommendation, i: number) => `${i + 1}. [${r.priority}] ${r.action} - Expected Impact: ${r.expected_impact}`).join('\n')
      : 'No recommendations available'

    const message = `Send the following social media performance report via email:
Recipients: ${recipientEmails}
Subject: ${subjectLine || 'Social Media Performance Report'}

Report Summary: ${aData.summary || 'N/A'}
Top Platform: ${aData.top_platform || 'N/A'}
Overall Engagement Rate: ${aData.overall_engagement_rate || 'N/A'}
Growth Trend: ${aData.growth_trend || 'N/A'}
Best Content Type: ${aData.best_content_type || 'N/A'}

Platform Metrics:
${metricsStr}

Recommendations:
${recsStr}`

    const result = await callAIAgent(message, AGENT_REPORT)

    if (result.success) {
      const data = parseAgentResponse<ReportData>(result)
      if (data) {
        setReportData(data)
        setReportStatus({ type: 'success', text: `Report delivered successfully!` })
      } else {
        setReportStatus({ type: 'success', text: 'Report delivery initiated!' })
      }
    } else {
      setReportStatus({ type: 'error', text: result.error || 'Failed to send report' })
    }

    setActiveAgentId(null)
    setReportLoading(false)
  }

  const displayData = sampleMode ? SAMPLE_ANALYTICS : analyticsData
  const metrics = Array.isArray(displayData?.platform_metrics) ? displayData.platform_metrics : []
  const recs = Array.isArray(displayData?.recommendations) ? displayData.recommendations : []

  const chartData = metrics.map(m => ({
    platform: m.platform,
    likes: parseInt(m.likes || '0', 10) || 0,
    shares: parseInt(m.shares || '0', 10) || 0,
    reach: parseInt(m.reach || '0', 10) || 0,
    impressions: parseInt(m.impressions || '0', 10) || 0,
    engagement_rate: parseFloat(m.engagement_rate || '0') || 0,
  }))

  const metricFields = ['likes', 'shares', 'reach', 'impressions', 'clicks']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Analyze performance and email reports to your team</p>
      </div>

      <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Engagement Metrics</CardTitle>
              <CardDescription>Enter your platform metrics for analysis</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setInputMode('structured')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${inputMode === 'structured' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Structured</button>
              <button onClick={() => setInputMode('bulk')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${inputMode === 'bulk' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Bulk Paste</button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inputMode === 'structured' ? (
            <div className="space-y-4">
              {['LinkedIn', 'Instagram', 'Twitter/X', 'Facebook', 'TikTok'].map(platform => {
                const pConf = getPlatformConfig(platform)
                const PIcon = pConf.icon
                const vals = platformInputs[platform] || {}
                return (
                  <div key={platform} className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <PIcon className="w-4 h-4" style={{ color: pConf.color }} />
                      <span className="text-sm font-medium">{platform}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {metricFields.map(field => (
                        <div key={field}>
                          <Label className="text-xs capitalize text-muted-foreground">{field}</Label>
                          <Input type="number" placeholder="0" value={vals[field] || ''} onChange={e => updatePlatformInput(platform, field, e.target.value)} className="mt-1 h-8 text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Textarea
              placeholder={"Paste your metrics data here. Example:\nLinkedIn: 2450 likes, 380 shares, 45000 reach, 67000 impressions\nInstagram: 5200 likes, 890 shares, 82000 reach, 120000 impressions"}
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              rows={8}
            />
          )}

          <div className="mt-4 space-y-3">
            <InlineStatus message={statusMessage} />
            <Button onClick={handleAnalyze} disabled={loading} className="w-full rounded-xl">
              {loading ? <><RiLoader4Line className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : <><RiBarChartLine className="w-4 h-4 mr-2" />Analyze Performance</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {displayData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={RiTrophyLine} label="Top Platform" value={displayData.top_platform || '--'} />
            <MetricCard icon={RiStarLine} label="Best Content Type" value={displayData.best_content_type || '--'} />
            <MetricCard icon={RiLineChartLine} label="Engagement Rate" value={displayData.overall_engagement_rate || '--'} />
            <MetricCard icon={RiArrowUpLine} label="Growth Trend" value={(displayData.growth_trend || '--').split(' - ')[0]} subtext={(displayData.growth_trend || '').includes(' - ') ? (displayData.growth_trend || '').split(' - ').slice(1).join(' - ') : undefined} />
          </div>

          {displayData.summary && (
            <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(displayData.summary)}</div>
              </CardContent>
            </Card>
          )}

          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Platform Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 35%, 88%)" />
                        <XAxis dataKey="platform" tick={{ fontSize: 12 }} stroke="hsl(20, 25%, 45%)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(20, 25%, 45%)" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(30, 35%, 88%)', backgroundColor: 'hsl(30, 40%, 96%)' }} />
                        <Legend />
                        <Bar dataKey="likes" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="shares" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Reach and Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 35%, 88%)" />
                        <XAxis dataKey="platform" tick={{ fontSize: 12 }} stroke="hsl(20, 25%, 45%)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(20, 25%, 45%)" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(30, 35%, 88%)', backgroundColor: 'hsl(30, 40%, 96%)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="reach" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ fill: CHART_COLORS[2], r: 4 }} />
                        <Line type="monotone" dataKey="impressions" stroke={CHART_COLORS[3]} strokeWidth={2} dot={{ fill: CHART_COLORS[3], r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {metrics.length > 0 && (
            <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Platform Metrics Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Platform</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Likes</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Shares</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Reach</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Impressions</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Eng. Rate</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m, i) => {
                        const mConf = getPlatformConfig(m.platform)
                        const MIcon = mConf.icon
                        const trendLower = (m.trend || '').toLowerCase()
                        return (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <MIcon className="w-4 h-4" style={{ color: mConf.color }} />
                                <span>{m.platform}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2">{m.likes}</td>
                            <td className="text-right py-3 px-2">{m.shares}</td>
                            <td className="text-right py-3 px-2">{m.reach}</td>
                            <td className="text-right py-3 px-2">{m.impressions}</td>
                            <td className="text-right py-3 px-2 font-medium">{m.engagement_rate}</td>
                            <td className="text-center py-3 px-2">
                              {trendLower === 'up' && <RiArrowUpLine className="w-4 h-4 text-green-600 mx-auto" />}
                              {trendLower === 'down' && <RiArrowDownLine className="w-4 h-4 text-red-500 mx-auto" />}
                              {trendLower === 'stable' && <span className="text-xs text-muted-foreground">Stable</span>}
                              {!['up', 'down', 'stable'].includes(trendLower) && <span className="text-xs text-muted-foreground">{m.trend || '--'}</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {recs.length > 0 && (
            <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recs.map((rec, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={rec.priority === 'High' ? 'default' : rec.priority === 'Medium' ? 'secondary' : 'outline'} className="text-xs">{rec.priority}</Badge>
                        </div>
                        <p className="text-sm font-medium">{rec.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">Expected Impact: {rec.expected_impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <RiMailLine className="w-5 h-5" />
                Email Report
              </CardTitle>
              <CardDescription>Send this performance report to your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-emails" className="text-sm">Recipient Email(s) *</Label>
                <Input id="report-emails" type="email" placeholder="team@example.com, manager@example.com" value={recipientEmails} onChange={e => setRecipientEmails(e.target.value)} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with commas</p>
              </div>
              <div>
                <Label htmlFor="report-subject" className="text-sm">Subject Line</Label>
                <Input id="report-subject" placeholder="Social Media Performance Report" value={subjectLine} onChange={e => setSubjectLine(e.target.value)} className="mt-1.5" />
              </div>

              <InlineStatus message={reportStatus} />

              {reportData && (
                <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <RiCheckLine className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Delivery Status: {reportData.delivery_status}</span>
                  </div>
                  {Array.isArray(reportData?.recipients) && reportData.recipients.length > 0 && (
                    <p className="text-xs text-muted-foreground">Recipients: {reportData.recipients.join(', ')}</p>
                  )}
                  {reportData.sent_at && <p className="text-xs text-muted-foreground">Sent at: {reportData.sent_at}</p>}
                  {reportData.subject_line && <p className="text-xs text-muted-foreground">Subject: {reportData.subject_line}</p>}
                  {reportData.email_preview && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <p className="text-xs bg-muted/50 p-2 rounded-lg leading-relaxed">{reportData.email_preview}</p>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleEmailReport} disabled={reportLoading || !recipientEmails.trim()} variant="outline" className="w-full rounded-xl">
                {reportLoading ? <><RiLoader4Line className="w-4 h-4 animate-spin mr-2" />Sending...</> : <><RiSendPlaneLine className="w-4 h-4 mr-2" />Email Report</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ==================== TWITTER SCREEN ====================
function TwitterScreen({ setActiveAgentId, sampleMode }: {
  setActiveAgentId: (id: string | null) => void
  sampleMode: boolean
}) {
  const [tweetContent, setTweetContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [tweetResult, setTweetResult] = useState<TweetData | null>(null)

  useEffect(() => {
    if (sampleMode) {
      setTweetContent(SAMPLE_TWEET_CONTENT)
    }
  }, [sampleMode])

  const charCount = tweetContent.length
  const charPercent = Math.min((charCount / 280) * 100, 100)
  const charColor = charCount >= 270 ? 'text-red-500' : charCount >= 240 ? 'text-orange-500' : 'text-muted-foreground'
  const progressColor = charCount >= 270 ? 'bg-red-500' : charCount >= 240 ? 'bg-orange-500' : ''

  const suggestedHashtags = ['#AI', '#Innovation', '#Tech', '#SocialMedia', '#Marketing', '#Growth', '#Digital', '#Startup']

  const addHashtag = (tag: string) => {
    if (tweetContent.length + tag.length + 1 <= 280) {
      setTweetContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + tag)
    }
  }

  const handlePostTweet = async () => {
    if (!tweetContent.trim()) { setStatusMessage({ type: 'error', text: 'Please write a tweet first' }); return }
    if (charCount > 280) { setStatusMessage({ type: 'error', text: 'Tweet exceeds 280 characters' }); return }

    setLoading(true)
    setStatusMessage(null)
    setTweetResult(null)
    setActiveAgentId(AGENT_TWITTER)

    const message = `Publish this tweet to Twitter/X: ${tweetContent}`
    const result = await callAIAgent(message, AGENT_TWITTER)

    if (result.success) {
      const data = parseAgentResponse<TweetData>(result)
      if (data) {
        setTweetResult(data)
        setStatusMessage({ type: 'success', text: 'Tweet published successfully!' })
      } else {
        setStatusMessage({ type: 'success', text: 'Tweet sent to Twitter for publishing!' })
      }
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Failed to publish tweet' })
    }

    setActiveAgentId(null)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Twitter Publisher</h2>
        <p className="text-sm text-muted-foreground mt-1">Compose and publish tweets directly to Twitter/X</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Write New Tweet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's happening?"
                value={tweetContent}
                onChange={e => setTweetContent(e.target.value)}
                rows={6}
                className="resize-none"
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Character count</span>
                  <span className={`text-sm font-medium ${charColor}`}>{charCount} / 280</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${progressColor || 'bg-primary'}`} style={{ width: `${charPercent}%` }} />
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Hashtag Suggestions</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map(tag => (
                    <button key={tag} onClick={() => addHashtag(tag)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20">
                      <RiHashtag className="w-3 h-3" />
                      {tag.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <InlineStatus message={statusMessage} />

              <Button onClick={handlePostTweet} disabled={loading || charCount === 0 || charCount > 280} className="w-full rounded-xl">
                {loading ? <><RiLoader4Line className="w-4 h-4 animate-spin mr-2" />Publishing...</> : <><RiSendPlaneLine className="w-4 h-4 mr-2" />Post to Twitter</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <RiEyeLine className="w-5 h-5" />
                Tweet Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-xl p-4 bg-background/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">U</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Your Account</span>
                      <span className="text-muted-foreground text-sm">@youraccount</span>
                    </div>
                    <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {tweetContent ? tweetContent.split(/(#\w+)/g).map((part, i) =>
                        part.startsWith('#') ? <span key={i} className="text-primary font-medium">{part}</span> : <React.Fragment key={i}>{part}</React.Fragment>
                      ) : <span className="text-muted-foreground">Your tweet preview will appear here...</span>}
                    </div>
                    {tweetContent && (
                      <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                        <span className="text-xs">Just now</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {tweetResult && (
            <Card className="bg-card/75 backdrop-blur-md border-white/20 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RiCheckLine className="w-5 h-5 text-green-600" />
                  Published
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="secondary">{tweetResult.publish_status}</Badge>
                  </div>
                  {tweetResult.character_count && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Characters</span>
                      <span className="text-sm">{tweetResult.character_count}</span>
                    </div>
                  )}
                  {tweetResult.published_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Published At</span>
                      <span className="text-sm">{tweetResult.published_at}</span>
                    </div>
                  )}
                </div>
                {tweetResult.tweet_content && (
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-sm">{tweetResult.tweet_content}</p>
                  </div>
                )}
                {Array.isArray(tweetResult?.hashtags_used) && tweetResult.hashtags_used.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tweetResult.hashtags_used.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                {tweetResult.tweet_url && (
                  <a href={tweetResult.tweet_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <RiExternalLinkLine className="w-4 h-4" />
                    View on Twitter
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN PAGE ====================
export default function Page() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [sampleMode, setSampleMode] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { key: 'calendar', label: 'Calendar', icon: RiCalendarLine },
    { key: 'analytics', label: 'Analytics', icon: RiBarChartLine },
    { key: 'twitter', label: 'Twitter', icon: RiTwitterXLine },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(30,50%,97%)] via-[hsl(20,45%,95%)] to-[hsl(40,40%,96%)] text-foreground">
        <div className="flex min-h-screen">
          <aside className="w-64 bg-card/60 backdrop-blur-md border-r border-white/20 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-border/50">
              <h1 className="text-lg font-semibold tracking-tight">Social Media</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Command Center</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeScreen === item.key
                return (
                  <button key={item.key} onClick={() => setActiveScreen(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Agents</p>
              <div className="space-y-2">
                {AGENTS.map(agent => (
                  <div key={agent.id} className="flex items-center gap-2" title={agent.purpose}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                    <span className="text-xs truncate">{agent.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0">
              <h2 className="text-base font-medium capitalize">{activeScreen}</h2>
              <div className="flex items-center gap-3">
                <Label htmlFor="sample-toggle" className="text-sm text-muted-foreground">Sample Data</Label>
                <Switch id="sample-toggle" checked={sampleMode} onCheckedChange={setSampleMode} />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {activeScreen === 'dashboard' && (
                <DashboardScreen calendarData={calendarData} analyticsData={analyticsData} setActiveScreen={setActiveScreen} sampleMode={sampleMode} />
              )}
              {activeScreen === 'calendar' && (
                <CalendarScreen calendarData={calendarData} setCalendarData={setCalendarData} setActiveAgentId={setActiveAgentId} sampleMode={sampleMode} />
              )}
              {activeScreen === 'analytics' && (
                <AnalyticsScreen analyticsData={analyticsData} setAnalyticsData={setAnalyticsData} setActiveAgentId={setActiveAgentId} sampleMode={sampleMode} />
              )}
              {activeScreen === 'twitter' && (
                <TwitterScreen setActiveAgentId={setActiveAgentId} sampleMode={sampleMode} />
              )}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
