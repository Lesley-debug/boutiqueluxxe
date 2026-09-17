<?php

namespace Database\Seeders;

use App\Models\AboutPage;
use App\Models\JournalPost;
use Illuminate\Database\Seeder;

class AboutAndJournalSeeder extends Seeder
{
    public function run(): void
    {
        AboutPage::current()->update([
            'hero_title' => 'More than an accessory.',
            'hero_subtitle' => 'Designer Bags Boutique was founded on a simple idea: that the pieces you carry every day should feel considered, not disposable. We curate handbags and watches for people who notice the details — the weight of good leather, the precision of a well-built clasp, the difference between something trendy and something that lasts.',
            'philosophy_title' => 'Our Philosophy',
            'philosophy_text' => 'Style shouldn\'t be complicated, and it shouldn\'t be fleeting. We believe the best pieces are the ones you reach for without thinking — versatile enough for a Tuesday, elegant enough for anything else. Every item in our collection is chosen because it earns its place in your everyday, not because it\'s having a moment.',
            'approach_title' => 'Our Approach',
            'approach_text' => 'We work directly with trusted sources to bring you authentic, carefully inspected pieces — no guesswork, no compromises. From the moment you browse to the moment your order arrives, we pay attention to the details that are easy to overlook but impossible to ignore once you notice them.',
            'contact_title' => 'Get in Touch',
            'contact_text' => 'Have a question about an order, a piece in our collection, or something you\'re looking for that you haven\'t seen yet? Reach out — we read every message personally.',
        ]);

        $posts = [
            [
                'title' => 'How to Choose the Perfect Handbag for Your Everyday Style',
                'slug' => 'choosing-the-perfect-everyday-handbag',
                'excerpt' => 'Size, structure, and material matter more than trend. Here\'s how to actually choose a bag you\'ll reach for every day.',
                'content' => '<h2>Start with how you actually live, not how you scroll</h2><p>It\'s easy to fall for a bag on a feed and forget to ask whether it fits your real days. Before anything else, think about what you carry: a laptop, a water bottle, just your phone and cards? A bag that photographs beautifully but can\'t hold your everyday essentials will end up in the back of your closet within a month.</p><h2>Structure changes everything</h2><p>A structured tote holds its shape and reads as polished — ideal for work or anywhere you want to look put-together without trying hard. A soft, slouchy shoulder bag feels more relaxed and forgiving, better suited to weekends and travel. Neither is "better" — they just serve different versions of your week.</p><h2>Leather quality shows up later, not immediately</h2><p>Two bags can look identical in a photo and age completely differently. Full-grain leather develops a rich patina over time; bonded or heavily coated leather tends to crack and peel. If you\'re investing in a piece meant to last years, this is the detail worth asking about before you buy.</p><h2>Neutral first, statement second</h2><p>If you\'re building a small, versatile collection rather than chasing every trend, start with a neutral — black, cognac, or a warm taupe — that works with nearly everything you already own. Let your statement pieces be the ones you add later, once your foundation is solid.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => '5 Ways to Style a Crossbody Bag',
                'slug' => '5-ways-to-style-a-crossbody-bag',
                'excerpt' => 'The most versatile bag in your collection deserves more than one look. Five ways to wear yours differently.',
                'content' => '<h2>1. Hands-free with tailoring</h2><p>A crossbody worn over a blazer or structured coat reads intentional, not casual — the strap sits like a design detail rather than an afterthought.</p><h2>2. Layered over a long coat in winter</h2><p>Let the strap sit outside your coat rather than underneath. It keeps the bag accessible and adds a defined line to an otherwise bulky silhouette.</p><h2>3. As your only bag while traveling</h2><p>A crossbody keeps your hands free through airports and cobblestone streets alike, and worn in front, it\'s naturally more secure in crowds.</p><h2>4. Dressed up for evening</h2><p>Swap a long strap for a shorter chain-style crossbody and it moves easily from daytime errands to dinner without a bag change.</p><h2>5. Front and center with monochrome outfits</h2><p>Against a single-color outfit, a crossbody in a contrasting tone becomes the focal point — no other accessories required.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(6),
            ],
            [
                'title' => 'How to Care for Your Leather Handbag',
                'slug' => 'how-to-care-for-your-leather-handbag',
                'excerpt' => 'Simple habits that keep a good leather bag looking good for years, not months.',
                'content' => '<h2>Condition before it needs it</h2><p>Leather dries out gradually, and by the time it visibly cracks, the damage is already done. A light leather conditioner every few months — more often in dry climates — keeps the material supple long before problems show.</p><h2>Store it standing, and stuffed</h2><p>Leaving a bag empty and lying flat for long stretches encourages creasing. Stuff it lightly with tissue paper or a soft cloth and store it upright, ideally in a dust bag out of direct sunlight.</p><h2>Spot-clean, don\'t soak</h2><p>Water and leather don\'t mix well. For everyday marks, a barely damp cloth and immediate drying is safer than any cleaning product. For anything more serious, a professional leather cleaner will always outperform a home remedy.</p><h2>Rotate your bags</h2><p>Using the same bag daily accelerates wear at the same stress points — corners, handles, the base. Rotating between two or three bags lets each one rest and lasts noticeably longer over time.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'The Ultimate Guide to Choosing a Watch',
                'slug' => 'the-ultimate-guide-to-choosing-a-watch',
                'excerpt' => 'Case size, movement, and materials — what actually matters when picking a watch that lasts.',
                'content' => '<h2>Case size should match your wrist, not the trend</h2><p>A 42mm case looks completely different on a slim wrist than a broad one. Try before committing to a size, and remember that proportion matters far more than whatever size is currently popular.</p><h2>Understand what "movement" actually means</h2><p>Quartz movements are accurate and low-maintenance — a good practical choice. Automatic movements are powered by the wearer\'s motion and prized for their craftsmanship, but need regular wear to stay accurate. Neither is objectively better; it depends what you value.</p><h2>Match the strap to your wardrobe, not just the watch</h2><p>A steel bracelet reads more versatile day-to-day; leather feels more formal but shows wear faster. Many watches now offer interchangeable straps — worth considering if you want one watch to do more.</p><h2>Buy for how you\'ll actually wear it</h2><p>A dive watch rated for real water resistance makes sense if you\'re active; a slim dress watch makes more sense if it\'s mostly for the office. Buying for an imagined lifestyle rather than your real one is the most common regret.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(1),
            ],
        ];

        foreach ($posts as $post) {
            JournalPost::updateOrCreate(['slug' => $post['slug']], $post);
        }
    }
}
