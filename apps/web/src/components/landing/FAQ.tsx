import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '#/components/ui/accordion'

const faqs = [
  {
    q: 'Is EventBid really free for hosts?',
    a: 'Yes. Posting a brief and receiving proposals is completely free, and there are no payments or deposits handled on the platform — EventBid is about comparing and deciding, not transactions.',
  },
  {
    q: 'How do venues find my brief?',
    a: 'When you publish a brief, our matching engine notifies venues that fit your capacity, location and date, then ranks them by style and amenities. You never have to search or reach out one by one.',
  },
  {
    q: 'Am I committing to anything when I post a brief?',
    a: 'No. A brief is just a request for proposals with no obligation. Accepting a proposal is a commitment to that venue, not a financial transaction — you decide if and when to lock a deal.',
  },
  {
    q: 'How do I communicate with a venue?',
    a: "Once a proposal is submitted, the venue's contact details are shared with you. Conversations happen directly over your preferred channel — EventBid keeps the discovery and comparison structured, not the messaging.",
  },
  {
    q: 'Can venues change their proposal after submitting?',
    a: 'Yes, until your deadline. Each revision is saved as a new version and you always see the latest one, with earlier versions kept for reference.',
  },
  {
    q: 'What happens when I accept a proposal?',
    a: 'The deal locks atomically — your chosen proposal is confirmed, all others are closed, and the brief is sealed as a permanent read-only record with the venue’s details.',
  },
]

export function FAQ() {
  return (
    <section className="bg-muted py-28 md:py-32">
      <div className="mx-auto max-w-[720px] px-6 md:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">FAQ</p>
          <h2 className="mt-4 font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Questions, answered
          </h2>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`} className="border-black/[0.06]">
              <AccordionTrigger className="py-6 text-[17px] font-normal text-foreground hover:no-underline [&[data-state=open]>svg]:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-[15px] leading-[1.7] text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
