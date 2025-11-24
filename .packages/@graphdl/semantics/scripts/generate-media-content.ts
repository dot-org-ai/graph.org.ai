#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate Media/Content domain TSV files and relationships
 * Covers: Content, Creative, Media, Images, Video, News, Blog
 */

function toPascalCase(text: string): string {
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
  const prepositions = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower) && !prepositions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

function writeTSV(filePath: string, headers: string[], rows: string[][]) {
  const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
  fs.writeFileSync(filePath, content)
}

async function generateContent() {
  console.log('\n📄 Generating Content.tsv...')

  const contentTypes = [
    { id: 'Article', name: 'Article', description: 'Written content piece', type: 'Written', format: 'Text' },
    { id: 'BlogPost', name: 'Blog Post', description: 'Blog article or post', type: 'Written', format: 'HTML' },
    { id: 'NewsArticle', name: 'News Article', description: 'News or journalistic content', type: 'Written', format: 'Text' },
    { id: 'Video', name: 'Video', description: 'Video content', type: 'Visual', format: 'Video' },
    { id: 'Podcast', name: 'Podcast', description: 'Audio podcast episode', type: 'Audio', format: 'Audio' },
    { id: 'Image', name: 'Image', description: 'Still image or photograph', type: 'Visual', format: 'Image' },
    { id: 'Infographic', name: 'Infographic', description: 'Visual information graphic', type: 'Visual', format: 'Image' },
    { id: 'Ebook', name: 'E-book', description: 'Electronic book', type: 'Written', format: 'PDF' },
    { id: 'Whitepaper', name: 'Whitepaper', description: 'Technical or authoritative report', type: 'Written', format: 'PDF' },
    { id: 'CaseStudy', name: 'Case Study', description: 'Detailed case study or success story', type: 'Written', format: 'Text' },
    { id: 'Tutorial', name: 'Tutorial', description: 'Educational how-to content', type: 'Educational', format: 'Mixed' },
    { id: 'Webinar', name: 'Webinar', description: 'Online seminar or presentation', type: 'Video', format: 'Video' },
    { id: 'Livestream', name: 'Live Stream', description: 'Live video broadcast', type: 'Video', format: 'Stream' },
    { id: 'SocialPost', name: 'Social Media Post', description: 'Social media content', type: 'Social', format: 'Mixed' },
    { id: 'Newsletter', name: 'Newsletter', description: 'Email newsletter', type: 'Written', format: 'HTML' },
    { id: 'PressRelease', name: 'Press Release', description: 'Official press statement', type: 'Written', format: 'Text' },
    { id: 'Review', name: 'Review', description: 'Product or service review', type: 'Written', format: 'Text' },
    { id: 'Interview', name: 'Interview', description: 'Interview content', type: 'Mixed', format: 'Mixed' },
    { id: 'Documentary', name: 'Documentary', description: 'Documentary film or series', type: 'Video', format: 'Video' },
    { id: 'Animation', name: 'Animation', description: 'Animated content', type: 'Visual', format: 'Video' },
  ]

  return contentTypes
}

async function generateCreative() {
  console.log('\n🎨 Generating Creative.tsv...')

  const creativeDisciplines = [
    { id: 'GraphicDesign', name: 'Graphic Design', description: 'Visual communication design', discipline: 'Design', medium: 'Digital' },
    { id: 'WebDesign', name: 'Web Design', description: 'Website and interface design', discipline: 'Design', medium: 'Digital' },
    { id: 'UxDesign', name: 'UX Design', description: 'User experience design', discipline: 'Design', medium: 'Digital' },
    { id: 'UiDesign', name: 'UI Design', description: 'User interface design', discipline: 'Design', medium: 'Digital' },
    { id: 'BrandDesign', name: 'Brand Design', description: 'Brand identity and visual design', discipline: 'Design', medium: 'Mixed' },
    { id: 'ProductDesign', name: 'Product Design', description: 'Physical and digital product design', discipline: 'Design', medium: 'Mixed' },
    { id: 'Illustration', name: 'Illustration', description: 'Visual illustration and artwork', discipline: 'Art', medium: 'Mixed' },
    { id: 'Photography', name: 'Photography', description: 'Photo capture and editing', discipline: 'Photography', medium: 'Digital' },
    { id: 'VideoProduction', name: 'Video Production', description: 'Video creation and editing', discipline: 'Video', medium: 'Digital' },
    { id: 'VideoEditing', name: 'Video Editing', description: 'Post-production video editing', discipline: 'Video', medium: 'Digital' },
    { id: 'MotionGraphics', name: 'Motion Graphics', description: 'Animated graphics and effects', discipline: 'Animation', medium: 'Digital' },
    { id: 'ThreeDAnimation', name: '3D Animation', description: 'Three-dimensional animation', discipline: 'Animation', medium: 'Digital' },
    { id: 'ContentWriting', name: 'Content Writing', description: 'Written content creation', discipline: 'Writing', medium: 'Text' },
    { id: 'Copywriting', name: 'Copywriting', description: 'Marketing and advertising copy', discipline: 'Writing', medium: 'Text' },
    { id: 'TechnicalWriting', name: 'Technical Writing', description: 'Technical documentation', discipline: 'Writing', medium: 'Text' },
    { id: 'CreativeWriting', name: 'Creative Writing', description: 'Fiction and creative prose', discipline: 'Writing', medium: 'Text' },
    { id: 'AudioProduction', name: 'Audio Production', description: 'Audio recording and production', discipline: 'Audio', medium: 'Digital' },
    { id: 'MusicProduction', name: 'Music Production', description: 'Music creation and production', discipline: 'Audio', medium: 'Digital' },
    { id: 'SoundDesign', name: 'Sound Design', description: 'Audio effects and sound design', discipline: 'Audio', medium: 'Digital' },
    { id: 'VoiceActing', name: 'Voice Acting', description: 'Voice over and narration', discipline: 'Audio', medium: 'Digital' },
  ]

  return creativeDisciplines
}

async function generateMedia() {
  console.log('\n📺 Generating Media.tsv...')

  const mediaTypes = [
    { id: 'Television', name: 'Television', description: 'TV broadcast and streaming', type: 'Broadcast', platform: 'TV' },
    { id: 'Radio', name: 'Radio', description: 'Radio broadcast', type: 'Broadcast', platform: 'Radio' },
    { id: 'Podcast', name: 'Podcast', description: 'On-demand audio shows', type: 'Digital', platform: 'Audio' },
    { id: 'YouTube', name: 'YouTube', description: 'YouTube video platform', type: 'Digital', platform: 'Video' },
    { id: 'StreamingVideo', name: 'Streaming Video', description: 'Video streaming services', type: 'Digital', platform: 'Video' },
    { id: 'StreamingAudio', name: 'Streaming Audio', description: 'Audio streaming services', type: 'Digital', platform: 'Audio' },
    { id: 'SocialMedia', name: 'Social Media', description: 'Social media platforms', type: 'Digital', platform: 'Social' },
    { id: 'Blog', name: 'Blog', description: 'Blog publishing', type: 'Digital', platform: 'Web' },
    { id: 'Website', name: 'Website', description: 'Web publishing', type: 'Digital', platform: 'Web' },
    { id: 'Email', name: 'Email', description: 'Email marketing and newsletters', type: 'Digital', platform: 'Email' },
    { id: 'MobileApp', name: 'Mobile App', description: 'Mobile application', type: 'Digital', platform: 'Mobile' },
    { id: 'Print', name: 'Print', description: 'Print publishing', type: 'Traditional', platform: 'Print' },
    { id: 'Newspaper', name: 'Newspaper', description: 'Newspaper publishing', type: 'Traditional', platform: 'Print' },
    { id: 'Magazine', name: 'Magazine', description: 'Magazine publishing', type: 'Traditional', platform: 'Print' },
    { id: 'Book', name: 'Book', description: 'Book publishing', type: 'Traditional', platform: 'Print' },
    { id: 'Cinema', name: 'Cinema', description: 'Movie theater exhibition', type: 'Traditional', platform: 'Theater' },
    { id: 'OutdoorAdvertising', name: 'Outdoor Advertising', description: 'Billboard and outdoor ads', type: 'Traditional', platform: 'Outdoor' },
    { id: 'DigitalSignage', name: 'Digital Signage', description: 'Digital display screens', type: 'Digital', platform: 'Display' },
    { id: 'Vr', name: 'Virtual Reality', description: 'VR content and experiences', type: 'Immersive', platform: 'VR' },
    { id: 'Ar', name: 'Augmented Reality', description: 'AR content and experiences', type: 'Immersive', platform: 'AR' },
  ]

  return mediaTypes
}

async function generateImages() {
  console.log('\n🖼️  Generating Images.tsv...')

  const imageTypes = [
    { id: 'Jpeg', name: 'JPEG', description: 'JPEG image format', format: 'JPEG', dimension: 'Raster' },
    { id: 'Png', name: 'PNG', description: 'PNG image format', format: 'PNG', dimension: 'Raster' },
    { id: 'Gif', name: 'GIF', description: 'GIF animated image format', format: 'GIF', dimension: 'Raster' },
    { id: 'Svg', name: 'SVG', description: 'Scalable vector graphics', format: 'SVG', dimension: 'Vector' },
    { id: 'Webp', name: 'WebP', description: 'Modern web image format', format: 'WebP', dimension: 'Raster' },
    { id: 'Tiff', name: 'TIFF', description: 'High-quality TIFF format', format: 'TIFF', dimension: 'Raster' },
    { id: 'Bmp', name: 'BMP', description: 'Bitmap image format', format: 'BMP', dimension: 'Raster' },
    { id: 'Raw', name: 'RAW', description: 'Camera raw image format', format: 'RAW', dimension: 'Raster' },
    { id: 'Heif', name: 'HEIF', description: 'High efficiency image format', format: 'HEIF', dimension: 'Raster' },
    { id: 'Avif', name: 'AVIF', description: 'AV1 image format', format: 'AVIF', dimension: 'Raster' },
    { id: 'Eps', name: 'EPS', description: 'Encapsulated PostScript', format: 'EPS', dimension: 'Vector' },
    { id: 'Ai', name: 'Adobe Illustrator', description: 'Adobe Illustrator format', format: 'AI', dimension: 'Vector' },
    { id: 'Psd', name: 'Photoshop', description: 'Adobe Photoshop format', format: 'PSD', dimension: 'Raster' },
    { id: 'Ico', name: 'Icon', description: 'Icon image format', format: 'ICO', dimension: 'Raster' },
    { id: 'Thumbnail', name: 'Thumbnail', description: 'Small preview image', format: 'Various', dimension: 'Raster' },
    { id: 'ProfilePhoto', name: 'Profile Photo', description: 'User profile picture', format: 'Various', dimension: 'Raster' },
    { id: 'Banner', name: 'Banner', description: 'Banner or header image', format: 'Various', dimension: 'Mixed' },
    { id: 'Logo', name: 'Logo', description: 'Company or brand logo', format: 'Various', dimension: 'Vector' },
    { id: 'Icon', name: 'Icon', description: 'UI icon or symbol', format: 'Various', dimension: 'Vector' },
    { id: 'Screenshot', name: 'Screenshot', description: 'Screen capture image', format: 'Various', dimension: 'Raster' },
  ]

  return imageTypes
}

async function generateVideo() {
  console.log('\n🎥 Generating Video.tsv...')

  const videoTypes = [
    { id: 'Mp4', name: 'MP4', description: 'MPEG-4 video format', format: 'MP4', resolution: 'Various' },
    { id: 'Mov', name: 'MOV', description: 'QuickTime video format', format: 'MOV', resolution: 'Various' },
    { id: 'Avi', name: 'AVI', description: 'Audio Video Interleave format', format: 'AVI', resolution: 'Various' },
    { id: 'Wmv', name: 'WMV', description: 'Windows Media Video format', format: 'WMV', resolution: 'Various' },
    { id: 'Webm', name: 'WebM', description: 'Web video format', format: 'WebM', resolution: 'Various' },
    { id: 'Flv', name: 'FLV', description: 'Flash video format', format: 'FLV', resolution: 'Various' },
    { id: 'Mkv', name: 'MKV', description: 'Matroska video format', format: 'MKV', resolution: 'Various' },
    { id: 'Threegp', name: '3GP', description: 'Mobile video format', format: '3GP', resolution: 'Mobile' },
    { id: 'Mpeg', name: 'MPEG', description: 'MPEG video format', format: 'MPEG', resolution: 'Various' },
    { id: 'Hd720p', name: 'HD 720p', description: '720p HD video', format: 'Various', resolution: '720p' },
    { id: 'Hd1080p', name: 'HD 1080p', description: '1080p Full HD video', format: 'Various', resolution: '1080p' },
    { id: 'Uhd4k', name: '4K UHD', description: '4K ultra high definition', format: 'Various', resolution: '4K' },
    { id: 'Uhd8k', name: '8K UHD', description: '8K ultra high definition', format: 'Various', resolution: '8K' },
    { id: 'VerticalVideo', name: 'Vertical Video', description: 'Portrait/vertical format', format: 'Various', resolution: 'Mobile' },
    { id: 'SquareVideo', name: 'Square Video', description: '1:1 square format', format: 'Various', resolution: 'Social' },
    { id: 'ShortFormVideo', name: 'Short-Form Video', description: 'Short video content', format: 'Various', resolution: 'Mobile' },
    { id: 'LongFormVideo', name: 'Long-Form Video', description: 'Extended video content', format: 'Various', resolution: 'Various' },
    { id: 'LiveVideo', name: 'Live Video', description: 'Live streaming video', format: 'Stream', resolution: 'Various' },
    { id: 'ThreeSixtyVideo', name: '360° Video', description: '360-degree immersive video', format: 'Various', resolution: 'Various' },
    { id: 'VrVideo', name: 'VR Video', description: 'Virtual reality video', format: 'Various', resolution: 'Stereoscopic' },
  ]

  return videoTypes
}

async function generateNews() {
  console.log('\n📰 Generating News.tsv...')

  const newsCategories = [
    { id: 'BreakingNews', name: 'Breaking News', description: 'Urgent breaking news', category: 'General', source: 'Various' },
    { id: 'LocalNews', name: 'Local News', description: 'Local community news', category: 'Regional', source: 'Local' },
    { id: 'NationalNews', name: 'National News', description: 'National news coverage', category: 'Regional', source: 'National' },
    { id: 'InternationalNews', name: 'International News', description: 'Global news coverage', category: 'Regional', source: 'International' },
    { id: 'Politics', name: 'Politics', description: 'Political news and analysis', category: 'Topic', source: 'Various' },
    { id: 'Business', name: 'Business', description: 'Business and finance news', category: 'Topic', source: 'Various' },
    { id: 'Technology', name: 'Technology', description: 'Tech industry news', category: 'Topic', source: 'Various' },
    { id: 'Sports', name: 'Sports', description: 'Sports news and scores', category: 'Topic', source: 'Various' },
    { id: 'Entertainment', name: 'Entertainment', description: 'Entertainment and celebrity news', category: 'Topic', source: 'Various' },
    { id: 'Health', name: 'Health', description: 'Health and medical news', category: 'Topic', source: 'Various' },
    { id: 'Science', name: 'Science', description: 'Scientific discoveries and research', category: 'Topic', source: 'Various' },
    { id: 'Environment', name: 'Environment', description: 'Environmental and climate news', category: 'Topic', source: 'Various' },
    { id: 'Education', name: 'Education', description: 'Education news and policy', category: 'Topic', source: 'Various' },
    { id: 'Crime', name: 'Crime', description: 'Crime and public safety news', category: 'Topic', source: 'Various' },
    { id: 'Weather', name: 'Weather', description: 'Weather forecasts and alerts', category: 'Topic', source: 'Various' },
    { id: 'Opinion', name: 'Opinion', description: 'Opinion and editorial content', category: 'Commentary', source: 'Various' },
    { id: 'InvestigativeJournalism', name: 'Investigative Journalism', description: 'In-depth investigative reporting', category: 'Long-form', source: 'Various' },
    { id: 'FeatureStory', name: 'Feature Story', description: 'Long-form feature articles', category: 'Long-form', source: 'Various' },
    { id: 'PhotoEssay', name: 'Photo Essay', description: 'Visual storytelling through photos', category: 'Visual', source: 'Various' },
    { id: 'VideoNews', name: 'Video News', description: 'Video news segments', category: 'Visual', source: 'Various' },
  ]

  return newsCategories
}

async function generateBlog() {
  console.log('\n✍️  Generating Blog.tsv...')

  const blogTypes = [
    { id: 'PersonalBlog', name: 'Personal Blog', description: 'Personal life and experiences', platform: 'Various', niche: 'Lifestyle' },
    { id: 'BusinessBlog', name: 'Business Blog', description: 'Business insights and strategy', platform: 'Corporate', niche: 'Business' },
    { id: 'TechBlog', name: 'Tech Blog', description: 'Technology and development', platform: 'Various', niche: 'Technology' },
    { id: 'TravelBlog', name: 'Travel Blog', description: 'Travel experiences and guides', platform: 'Various', niche: 'Travel' },
    { id: 'FoodBlog', name: 'Food Blog', description: 'Recipes and food reviews', platform: 'Various', niche: 'Food' },
    { id: 'FashionBlog', name: 'Fashion Blog', description: 'Fashion trends and style', platform: 'Various', niche: 'Fashion' },
    { id: 'HealthBlog', name: 'Health Blog', description: 'Health and wellness content', platform: 'Various', niche: 'Health' },
    { id: 'FitnessBlog', name: 'Fitness Blog', description: 'Fitness and exercise tips', platform: 'Various', niche: 'Fitness' },
    { id: 'ParentingBlog', name: 'Parenting Blog', description: 'Parenting advice and stories', platform: 'Various', niche: 'Family' },
    { id: 'FinanceBlog', name: 'Finance Blog', description: 'Personal finance and investing', platform: 'Various', niche: 'Finance' },
    { id: 'MarketingBlog', name: 'Marketing Blog', description: 'Marketing strategies and tips', platform: 'Various', niche: 'Marketing' },
    { id: 'EducationBlog', name: 'Education Blog', description: 'Educational content and resources', platform: 'Various', niche: 'Education' },
    { id: 'PhotoBlog', name: 'Photo Blog', description: 'Photography showcase', platform: 'Various', niche: 'Photography' },
    { id: 'VideoBlog', name: 'Video Blog (Vlog)', description: 'Video blog content', platform: 'YouTube', niche: 'Various' },
    { id: 'MusicBlog', name: 'Music Blog', description: 'Music reviews and industry news', platform: 'Various', niche: 'Music' },
    { id: 'GamingBlog', name: 'Gaming Blog', description: 'Video game reviews and news', platform: 'Various', niche: 'Gaming' },
    { id: 'PoliticalBlog', name: 'Political Blog', description: 'Political commentary and analysis', platform: 'Various', niche: 'Politics' },
    { id: 'NewsBlog', name: 'News Blog', description: 'News aggregation and commentary', platform: 'Various', niche: 'News' },
    { id: 'ReviewBlog', name: 'Review Blog', description: 'Product and service reviews', platform: 'Various', niche: 'Reviews' },
    { id: 'NicheBlog', name: 'Niche Blog', description: 'Specialized topic blog', platform: 'Various', niche: 'Specialized' },
  ]

  return blogTypes
}

async function generateRelationships(
  repoRoot: string,
  dataDir: string,
  contentTypes: any[],
  creativeDisciplines: any[],
  mediaTypes: any[],
  imageTypes: any[],
  videoTypes: any[],
  newsCategories: any[],
  blogTypes: any[]
) {
  console.log('\n🔗 Generating Relationship files...')

  // Content.Media.tsv - Link content types to media platforms
  const contentMediaRels: string[][] = []
  contentMediaRels.push(['Article', 'Website'])
  contentMediaRels.push(['Article', 'Blog'])
  contentMediaRels.push(['BlogPost', 'Blog'])
  contentMediaRels.push(['NewsArticle', 'Newspaper'])
  contentMediaRels.push(['NewsArticle', 'Website'])
  contentMediaRels.push(['Video', 'YouTube'])
  contentMediaRels.push(['Video', 'StreamingVideo'])
  contentMediaRels.push(['Video', 'Television'])
  contentMediaRels.push(['Podcast', 'Podcast'])
  contentMediaRels.push(['Podcast', 'StreamingAudio'])
  contentMediaRels.push(['Image', 'Website'])
  contentMediaRels.push(['Image', 'SocialMedia'])
  contentMediaRels.push(['Webinar', 'StreamingVideo'])
  contentMediaRels.push(['Livestream', 'StreamingVideo'])
  contentMediaRels.push(['SocialPost', 'SocialMedia'])
  contentMediaRels.push(['Newsletter', 'Email'])
  writeTSV(path.join(dataDir, 'Content.Media.tsv'), ['contentId', 'mediaId'], contentMediaRels)
  console.log(`  ✓ Content.Media.tsv (${contentMediaRels.length} relationships)`)

  // Creative.Tools.tsv - Link creative disciplines to tools (from existing Tools.tsv)
  const creativeToolsRels: string[][] = []
  const toolsPath = path.join(dataDir, 'Tools.tsv')
  if (fs.existsSync(toolsPath)) {
    const toolsContent = fs.readFileSync(toolsPath, 'utf-8')
    const toolsLines = toolsContent.split('\n').slice(1)
    const toolIds = toolsLines.map(line => line.split('\t')[0]).filter(id => id)

    // Map creative disciplines to relevant tools
    creativeToolsRels.push(['GraphicDesign', 'ComputerGraphicsDesignSoftware'])
    creativeToolsRels.push(['WebDesign', 'WebDevelopmentSoftware'])
    creativeToolsRels.push(['Photography', 'DigitalCameras'])
    creativeToolsRels.push(['VideoProduction', 'VideoCameras'])
    creativeToolsRels.push(['VideoEditing', 'VideoEditingSoftware'])
  }
  writeTSV(path.join(dataDir, 'Creative.Tools.tsv'), ['creativeId', 'toolId'], creativeToolsRels)
  console.log(`  ✓ Creative.Tools.tsv (${creativeToolsRels.length} relationships)`)

  // Media.Apps.tsv - Link media types to apps
  const mediaAppsRels: string[][] = []
  const appsPath = path.join(dataDir, 'Apps.tsv')
  if (fs.existsSync(appsPath)) {
    const appsContent = fs.readFileSync(appsPath, 'utf-8')
    const appsLines = appsContent.split('\n')

    for (let i = 1; i < appsLines.length; i++) {
      const line = appsLines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const appId = cols[0]
      const appName = cols[1]?.toLowerCase() || ''
      const category = cols[4]?.toLowerCase() || ''

      // Match apps to media types
      if (category.includes('video') || appName.includes('video') || appName.includes('youtube')) {
        mediaAppsRels.push(['YouTube', appId])
      }
      if (category.includes('social') || appName.includes('social')) {
        mediaAppsRels.push(['SocialMedia', appId])
      }
      if (category.includes('email') || category.includes('newsletter')) {
        mediaAppsRels.push(['Email', appId])
      }
      if (category.includes('blog') || appName.includes('blog')) {
        mediaAppsRels.push(['Blog', appId])
      }
      if (category.includes('podcast') || appName.includes('podcast')) {
        mediaAppsRels.push(['Podcast', appId])
      }
    }
  }
  writeTSV(path.join(dataDir, 'Media.Apps.tsv'), ['mediaId', 'appId'], mediaAppsRels)
  console.log(`  ✓ Media.Apps.tsv (${mediaAppsRels.length} relationships)`)

  // Images.Products.tsv - Link image formats to products
  const imagesProductsRels: string[][] = []
  const productsPath = path.join(dataDir, 'Products.tsv')
  if (fs.existsSync(productsPath)) {
    const productsContent = fs.readFileSync(productsPath, 'utf-8')
    const productsLines = productsContent.split('\n')
    const seenProducts = new Set<string>()

    for (let i = 1; i < Math.min(productsLines.length, 10000); i++) {
      const line = productsLines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const productId = cols[0]
      const productName = cols[1]?.toLowerCase() || ''

      if (seenProducts.has(productId)) continue

      if (productName.includes('photo') || productName.includes('camera') ||
          productName.includes('image') || productName.includes('picture') ||
          productName.includes('photograph') || productName.includes('scanner')) {
        imagesProductsRels.push(['Jpeg', productId])
        imagesProductsRels.push(['Png', productId])
        seenProducts.add(productId)
      }
    }
  }
  writeTSV(path.join(dataDir, 'Images.Products.tsv'), ['imageId', 'productId'], imagesProductsRels)
  console.log(`  ✓ Images.Products.tsv (${imagesProductsRels.length} relationships)`)

  // Video.Tech.tsv - Link video formats to technologies
  const videoTechRels: string[][] = []
  const techPath = path.join(dataDir, 'Tech.tsv')
  if (fs.existsSync(techPath)) {
    const techContent = fs.readFileSync(techPath, 'utf-8')
    const techLines = techContent.split('\n').slice(1)

    for (const line of techLines) {
      if (!line.trim()) continue

      const cols = line.split('\t')
      const techId = cols[0]
      const techName = cols[1]?.toLowerCase() || ''

      if (techName.includes('video') || techName.includes('stream')) {
        videoTechRels.push(['Mp4', techId])
      }
    }
  }
  writeTSV(path.join(dataDir, 'Video.Tech.tsv'), ['videoId', 'techId'], videoTechRels)
  console.log(`  ✓ Video.Tech.tsv (${videoTechRels.length} relationships)`)

  // News.Media.tsv - Link news categories to media platforms
  const newsMediaRels: string[][] = []
  newsMediaRels.push(['BreakingNews', 'Television'])
  newsMediaRels.push(['BreakingNews', 'Website'])
  newsMediaRels.push(['LocalNews', 'Newspaper'])
  newsMediaRels.push(['LocalNews', 'Television'])
  newsMediaRels.push(['NationalNews', 'Newspaper'])
  newsMediaRels.push(['NationalNews', 'Television'])
  newsMediaRels.push(['InternationalNews', 'Television'])
  newsMediaRels.push(['Politics', 'Website'])
  newsMediaRels.push(['Business', 'Magazine'])
  newsMediaRels.push(['Technology', 'Website'])
  newsMediaRels.push(['Sports', 'Television'])
  newsMediaRels.push(['VideoNews', 'Television'])
  newsMediaRels.push(['VideoNews', 'Website'])
  writeTSV(path.join(dataDir, 'News.Media.tsv'), ['newsId', 'mediaId'], newsMediaRels)
  console.log(`  ✓ News.Media.tsv (${newsMediaRels.length} relationships)`)

  // Blog.Content.tsv - Link blog types to content types
  const blogContentRels: string[][] = []
  blogContentRels.push(['PersonalBlog', 'BlogPost'])
  blogContentRels.push(['BusinessBlog', 'Article'])
  blogContentRels.push(['TechBlog', 'Tutorial'])
  blogContentRels.push(['TravelBlog', 'BlogPost'])
  blogContentRels.push(['FoodBlog', 'BlogPost'])
  blogContentRels.push(['FashionBlog', 'Image'])
  blogContentRels.push(['PhotoBlog', 'Image'])
  blogContentRels.push(['VideoBlog', 'Video'])
  blogContentRels.push(['ReviewBlog', 'Review'])
  writeTSV(path.join(dataDir, 'Blog.Content.tsv'), ['blogId', 'contentId'], blogContentRels)
  console.log(`  ✓ Blog.Content.tsv (${blogContentRels.length} relationships)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('MEDIA/CONTENT DOMAIN GENERATION')
  console.log('='.repeat(100))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Generate domain files
  const contentTypes = await generateContent()
  const contentHeaders = ['id', 'name', 'description', 'type', 'format']
  const contentRows = contentTypes.map(c => [c.id, c.name, c.description, c.type, c.format])
  writeTSV(path.join(dataDir, 'Content.tsv'), contentHeaders, contentRows)
  console.log(`  ✓ Content.tsv (${contentTypes.length} content types)`)

  const creativeDisciplines = await generateCreative()
  const creativeHeaders = ['id', 'name', 'description', 'discipline', 'medium']
  const creativeRows = creativeDisciplines.map(c => [c.id, c.name, c.description, c.discipline, c.medium])
  writeTSV(path.join(dataDir, 'Creative.tsv'), creativeHeaders, creativeRows)
  console.log(`  ✓ Creative.tsv (${creativeDisciplines.length} creative disciplines)`)

  const mediaTypes = await generateMedia()
  const mediaHeaders = ['id', 'name', 'description', 'type', 'platform']
  const mediaRows = mediaTypes.map(m => [m.id, m.name, m.description, m.type, m.platform])
  writeTSV(path.join(dataDir, 'Media.tsv'), mediaHeaders, mediaRows)
  console.log(`  ✓ Media.tsv (${mediaTypes.length} media types)`)

  const imageTypes = await generateImages()
  const imagesHeaders = ['id', 'name', 'description', 'format', 'dimension']
  const imagesRows = imageTypes.map(i => [i.id, i.name, i.description, i.format, i.dimension])
  writeTSV(path.join(dataDir, 'Images.tsv'), imagesHeaders, imagesRows)
  console.log(`  ✓ Images.tsv (${imageTypes.length} image types)`)

  const videoTypes = await generateVideo()
  const videoHeaders = ['id', 'name', 'description', 'format', 'resolution']
  const videoRows = videoTypes.map(v => [v.id, v.name, v.description, v.format, v.resolution])
  writeTSV(path.join(dataDir, 'Video.tsv'), videoHeaders, videoRows)
  console.log(`  ✓ Video.tsv (${videoTypes.length} video types)`)

  const newsCategories = await generateNews()
  const newsHeaders = ['id', 'name', 'description', 'category', 'source']
  const newsRows = newsCategories.map(n => [n.id, n.name, n.description, n.category, n.source])
  writeTSV(path.join(dataDir, 'News.tsv'), newsHeaders, newsRows)
  console.log(`  ✓ News.tsv (${newsCategories.length} news categories)`)

  const blogTypes = await generateBlog()
  const blogHeaders = ['id', 'name', 'description', 'platform', 'niche']
  const blogRows = blogTypes.map(b => [b.id, b.name, b.description, b.platform, b.niche])
  writeTSV(path.join(dataDir, 'Blog.tsv'), blogHeaders, blogRows)
  console.log(`  ✓ Blog.tsv (${blogTypes.length} blog types)`)

  // Generate relationships
  await generateRelationships(
    repoRoot,
    dataDir,
    contentTypes,
    creativeDisciplines,
    mediaTypes,
    imageTypes,
    videoTypes,
    newsCategories,
    blogTypes
  )

  console.log('\n' + '='.repeat(100))
  console.log('✅ Media/Content domain files generated!')
  console.log('='.repeat(100))
  console.log('\n📊 Summary:')
  console.log(`  - Content types: ${contentTypes.length}`)
  console.log(`  - Creative disciplines: ${creativeDisciplines.length}`)
  console.log(`  - Media types: ${mediaTypes.length}`)
  console.log(`  - Image formats: ${imageTypes.length}`)
  console.log(`  - Video formats: ${videoTypes.length}`)
  console.log(`  - News categories: ${newsCategories.length}`)
  console.log(`  - Blog types: ${blogTypes.length}`)
  console.log('='.repeat(100))
}

main().catch(console.error)
