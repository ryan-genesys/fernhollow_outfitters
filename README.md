# Fernhollow Outfitters: Genesys Cloud Web Messaging demo

A realistic customer storefront for showing consultants how Web Messaging, a bot, and (next) Digital User Tracking come together in a production-style environment. Fernhollow is fictional.

## What's here

```
index.html          Home
shop.html           Product listing (?cat=jackets|packs|footwear|camping)
product.html        Product detail (?id=trail-shell, etc.)
cart.html           Cart with sample items
order-status.html   Order lookup form plus "Ask Fern" panel
returns.html        Returns policy and "Start a return with Fern"
help.html           Help center, contact options, FAQ
demo-guide.html     Internal presenter guide (scenarios, test data)
assets/styles.css   Shared styles
assets/site.js      Header/footer, demo data, Messenger helpers, tracking hooks
bot/orders.csv      Test orders to import into an Architect data table
```

## Run it

The Messenger only loads over http(s), so serve the folder instead of opening files directly:

```
python3 -m http.server 8080
```

Then open http://localhost:8080. If the Messenger deployment restricts allowed domains, add the host you serve from (for example `localhost`, or your hosting domain). Any static host works (S3, Azure Static Web Apps, Netlify, GitHub Pages).

## The Messenger snippet

Your deployment snippet is in the `<head>` of every page, so the conversation stays with the shopper as they navigate.

- Region: `apps.mypurecloud.com` (Americas, US East)
- Deployment ID: `10b95755-9512-4bc6-a2bb-f13ebb0fedc3`

To point the site at another org, replace the snippet in each HTML file (a find-and-replace on the deployment ID and region URL does it).

## How the site talks to the Messenger

Every "Chat" button on the site calls `openMessenger(entryPoint)` in `assets/site.js`, which:

1. Sets custom attributes with `Genesys("command", "Database.set", ...)`: `entryPoint`, `pageTitle`, `pagePath`.
2. Opens the Messenger with `Genesys("command", "Messenger.open")`.

In Architect, read those attributes with **Get Participant Data** in the inbound message flow and use them to greet, skip the menu, or route. Custom attributes apply to a new conversation; an active conversation keeps its original values. The full list of entry points is in `demo-guide.html`.

## Bot use case: Fern, the virtual assistant

**Goal:** Contain the most common contact reasons for an online retailer (order status and returns) and hand everything else to an agent with context already gathered.

### Architecture

The Architect exports in `architect/` implement this with your org's objects:

```
Messenger deployment
  -> Inbound message flow "Web Messenger Training"
       Get Participant Data: entryPoint, pageTitle, pagePath
       Set greeting, routingReason, and priority from entryPoint
       entryPoint is product-question, order-delayed, or return-outside-window
         -> greet in context -> Transfer to ACD "Training"
       otherwise
         -> Call Digital Bot Flow "Web Messenger Training Digital Bot" (Fern)
         -> Fern exits only when a person is needed -> Transfer to ACD "Training"
```

| File | What it is |
|---|---|
| `architect/Web_Messenger_Training_v1-1.yaml` | Agent-only version: contextual greeting, routing reason, priority |
| `architect/Web_Messenger_Training_Digital_Bot_v1-1.yaml` | Same, plus Fern for chats the site can't classify |
| `architect/BOT_BUILD.md` | How to build Fern's intents, slots, data table lookup, and tasks |

Priority by entry point: delayed order 10, return past window 5, cart help 5, product question 3, everything else 0. The `routingReason` participant attribute gives the agent a plain-English reason for the chat.

Both exports use the flow name "Web Messenger Training", so importing one replaces the other. Rename one before importing if you want both.

## Digital User Tracking (next phase)

The site already calls `track(eventName, attributes)` at each meaningful shopper action: product views, add to cart, cart and checkout, order lookups, and chat opens. Today those calls only log to the browser console.

To turn tracking on:

1. Enable tracking on the Messenger deployment in Genesys Cloud. Page views are then captured from the same snippet.
2. In `assets/site.js`, set `DUT_ENABLED = true` so the custom events go to Genesys too. Confirm the `Journey.record` command against the current Messenger SDK docs first.

The event list is in `demo-guide.html`.
