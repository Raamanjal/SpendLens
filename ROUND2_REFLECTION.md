# Round 2 Reflection

## 1. Most uncomfortable trade-off

The uncomfortable trade-off was adding email capture to the initial audit form. It slightly increases friction before users see the result, but it makes the Round 2 feature much cleaner because every stored audit has a reliable owner for future pricing-change notifications. Depending only on the later lead-capture form would create audits that could never be notified.

## 2. What I would do first with another 24 hours

I would add a small admin page for detection runs. It would show the number of audits scanned, affected users, emails sent, and the most common pricing changes. Right now the manual endpoint works, but an admin page would make the operational loop easier to verify without digging through logs.

## 3. What in Round 1 made Round 2 harder

The Round 1 code saved audit results, but it did not originally treat pricing data as part of the audit record. That meant Round 2 needed a pricing snapshot layer before change detection could be honest. If I were rebuilding Round 1, I would store the exact audit context from day one: input, output, pricing version, and user contact state.
