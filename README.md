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

```
Messenger deployment
  -> Inbound message flow "Fernhollow Web Messaging"
       Get Participant Data: entryPoint, pageTitle, pagePath
       entryPoint = product-question  -> Transfer to ACD "Fernhollow Gear Specialists"
       otherwise                      -> Call Digital Bot Flow "Fern Virtual Assistant"
                                            exit: escalate -> Transfer to ACD "Fernhollow Web Support"
                                            exit: resolved -> Disconnect
```

### Intents

| Intent | Sample utterances | Slots | Outcome |
|---|---|---|---|
| OrderStatus | "Where's my order?", "Track my package", "Has my order shipped?" | OrderNumber, Email | Look up the order and reply with status. Delayed orders escalate. |
| StartReturn | "I want to return something", "Start a return", "This doesn't fit" | OrderNumber, Email | If delivered within 60 days, confirm the return and say a label is emailed. Otherwise offer the warranty team. |
| TalkToAgent | "Agent", "Talk to a person", "Representative" | none | Escalate. |
| Fallback | anything unrecognized twice | none | Escalate. |

### Slot types

- **OrderNumber:** a regular-expression slot type matching `FH-?\d{6}`. Normalize to `FH-######` before the lookup.
- **Email:** a regular-expression slot type for email addresses.

### Data

Create a data table named **Fernhollow Orders** with `orderNumber` as the key and the other columns from `bot/orders.csv` as string fields, then import the CSV. In the bot, use **Data Table Lookup** on the order number and check that the email matches before revealing anything.

For a closer-to-production pattern, swap the data table for a web services data action against an order API. The bot logic stays the same.

### Escalation context

Before the bot exits to an agent, set participant data so the agent sees why:

- `botIntent`: `OrderStatus`, `StartReturn`, or `TalkToAgent`
- `orderNumber`: when collected
- `escalationReason`: for example `order-delayed`, `outside-return-window`, `customer-request`

Delayed orders are a good place to show raised priority on the transfer.

### Suggested object names

| Object | Name |
|---|---|
| Messenger configuration | Fernhollow Messenger (primary color `#1F4A37`) |
| Inbound message flow | Fernhollow Web Messaging |
| Digital bot flow | Fern Virtual Assistant |
| Data table | Fernhollow Orders |
| Queues | Fernhollow Web Support, Fernhollow Gear Specialists |

Object and action names can vary by Genesys Cloud release, so check them in your org.

## Digital User Tracking (next phase)

The site already calls `track(eventName, attributes)` at each meaningful shopper action: product views, add to cart, cart and checkout, order lookups, and chat opens. Today those calls only log to the browser console.

To turn tracking on:

1. Enable tracking on the Messenger deployment in Genesys Cloud. Page views are then captured from the same snippet.
2. In `assets/site.js`, set `DUT_ENABLED = true` so the custom events go to Genesys too. Confirm the `Journey.record` command against the current Messenger SDK docs first.

The event list is in `demo-guide.html`.
