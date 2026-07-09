# SEO Report - Hamara Brand

## Executive Summary
Hamara Brand now has a usable SEO content structure instead of a single landing page. The site includes a homepage, a blog hub, an SEO landing-page hub, a keyword hub, and supporting articles that target both informational and transactional search intent.

The current setup is aimed at ranking for transit-media terms such as bus advertising, auto rickshaw branding, cab branding, and transit media advertising in India. It also includes trending and pricing-led content that can capture higher-funnel and mid-funnel traffic before users reach the lead form.

## What Was Implemented
### Core Site Structure
- Homepage updated with internal links to the SEO cluster.
- Blog hub added at [blog](blog/index.html).
- SEO hub added at [seo](seo/index.html).
- Keyword hub added at [keywords](keywords/index.html).

### Blog Content
Three blog posts were created to target trending and high-intent search queries:
- [Transit Media Advertising Trends for 2026](blog/transit-media-advertising-trends-2026/index.html)
- [Bus Advertising Cost in India](blog/bus-advertising-cost-in-india/index.html)
- [Auto Rickshaw Branding for Local Businesses](blog/auto-rickshaw-branding-for-local-businesses/index.html)

### SEO Landing Pages
Four transactional landing pages were created:
- [Transit Media Advertising](seo/transit-media-advertising/index.html)
- [Bus Advertising](seo/bus-advertising/index.html)
- [Auto Rickshaw Branding](seo/auto-rickshaw-branding/index.html)
- [Cab Branding](seo/cab-branding/index.html)

### Crawl and Discovery Support
- `sitemap.xml` updated with all new routes.
- `feed.xml` updated with the blog posts.
- `llms.txt` updated to include the content cluster.
- Sitemap automation added with [scripts/generate-sitemaps.js](scripts/generate-sitemaps.js).
- GitHub Action added to regenerate the sitemap weekly: [.github/workflows/seo-generate.yml](.github/workflows/seo-generate.yml).

## SEO Strategy Behind the Pages
### 1. Keyword Cluster Design
The site now groups pages by search intent:
- Broad commercial intent: transit media advertising
- Pricing intent: bus advertising cost in India
- Local intent: auto rickshaw branding for local businesses
- Premium city intent: cab branding
- Trend intent: transit media advertising trends 2026

### 2. Internal Linking
The homepage now links into the SEO cluster, and the cluster links back into each other. This is important because:
- Search engines can understand topic hierarchy more clearly.
- Users can move from informational content to service pages.
- Authority is distributed across the new routes instead of being concentrated only on the homepage.

### 3. Content Funnel
The content is built as a funnel:
- Blog posts answer questions and capture discovery traffic.
- SEO landing pages convert users searching for services.
- The keyword hub documents the terms and page mappings.

## Current SEO Assets Overview
### Homepage
The homepage still serves as the main brand and lead-generation page, but it now has a supporting content cluster section. That section points to blog, SEO, and keyword pages.

### Blog Hub
The blog hub is focused on educational and trend-based content. It is useful for attracting users early in the research cycle and for building topical relevance around transit media.

### SEO Hub
The SEO hub acts as the service directory. It organizes the transactional pages and gives a central place for users and crawlers to find the main money pages.

### Keyword Hub
The keyword hub maps primary, long-tail, and trending phrases to the best destination page. This helps reduce keyword cannibalization and makes content planning more disciplined.

## Sitemap and Indexing Status
### Sitemap
The sitemap now includes:
- Homepage
- Blog hub
- Blog posts
- SEO hub
- SEO landing pages
- Keyword hub

This improves crawl discovery and gives each route a direct indexable entry.

### RSS Feed
The RSS feed now includes the blog articles, which helps content discovery and gives the site a cleaner publication footprint.

### Validation
The new routes were checked and verified on disk, and the sitemap includes the expected hubs. The XML files were also validated as well-formed.

## Strengths of the Current Setup
- Clear topical cluster around transit media.
- Good mix of informational and transactional pages.
- Better internal linking than the original single-page setup.
- Sitemap and feed support are in place.
- Automation exists for future sitemap regeneration.
- The content uses realistic buyer-intent topics rather than generic filler.

## Gaps and Risks
### 1. Limited Content Depth
The current cluster is good for a launch, but it is still small. Ranking potential will improve as more supporting pages are added.

### 2. No Dynamic Blog CMS Yet
The blog is currently static HTML. That is fine for now, but scaling content volume will be easier with a lightweight CMS, markdown workflow, or structured content source.

### 3. No Page-Level Schema Expansion
The pages exist, but not every page currently has deep structured data beyond the article pages. Adding FAQ, BreadcrumbList, and Service schema would improve clarity.

### 4. No Search Console Data Yet
The site still needs real query data from Google Search Console before keyword decisions can be optimized based on impressions, CTR, and ranking position.

### 5. No Content Refresh Process Beyond Sitemap Generation
The sitemap automation is useful, but the content itself still needs a monthly review cycle for titles, descriptions, and internal links.

## Recommended Next Steps
### High Priority
1. Add 10 to 20 more blog posts around real queries.
2. Expand each SEO landing page with FAQ sections, proof points, and schema.
3. Submit the sitemap to Google Search Console and Bing Webmaster Tools.
4. Track clicks and impressions for the new pages.

### Medium Priority
1. Add city-specific landing pages for major markets such as Mumbai, Delhi, Bangalore, and Hyderabad.
2. Build comparison pages such as bus advertising vs cab branding.
3. Add case-study style posts for enterprise and local business use cases.
4. Add breadcrumb navigation to the SEO pages.

### Lower Priority
1. Create a content calendar for seasonal topics and festival campaigns.
2. Add JSON-LD schema for FAQ, WebPage, and BreadcrumbList on the main SEO pages.
3. Add social preview images for each core article and landing page.

## Suggested Keyword Targets
### Core Commercial Terms
- transit media advertising
- bus advertising
- auto rickshaw branding
- cab branding

### Long-Tail Terms
- bus advertising cost in India
- auto rickshaw branding for local businesses
- cab branding for city campaigns
- best transit media company in India

### Trend and Discovery Terms
- transit media advertising trends 2026
- QR code campaigns for offline media
- hyperlocal marketing in Indian cities
- festive season outdoor advertising

## Recommended Content Plan
A practical next batch of content should include:
- City-specific pages
- Pricing pages
- Comparison pages
- Use-case pages for clinics, restaurants, retailers, and real estate
- Trend reports and seasonal campaign guides

Example future article ideas:
- Bus Advertising Cost in Mumbai
- Best Transit Media Formats for Local Business Growth
- Cab Branding vs Bus Branding: Which Works Better?
- Auto Branding Ideas for Clinics and Hospitals
- Top Transit Media Trends for Festival Campaigns

## Final Assessment
The site is now set up with a legitimate SEO foundation. It is no longer just a homepage with contact info. It has:
- topical depth,
- supporting content,
- transactional pages,
- internal links,
- crawlable index paths,
- and automation for sitemap refreshes.

That gives the project a workable base for organic growth. The next gains will come from publishing more content, adding schema, and tracking real search performance data.
