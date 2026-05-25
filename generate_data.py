#!/usr/bin/env python3
"""Generate realistic POS data for Padmanadi Vegan Eatery (Calgary) - May 2026"""

import csv, os, random
from datetime import datetime, timedelta

random.seed(2026)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(OUT, exist_ok=True)

# ═══════════════════════════════════════════════════════════
# MENU — extracted from Padmanadi Calgary PDF + drink/dessert photos
# (id, category, name, price, is_spicy)
# ═══════════════════════════════════════════════════════════
MENU = [
    (1,  "Starters", "Vegetable Spring Rolls (3pc)", 6.00, False),
    (2,  "Starters", "Vegetable Spring Rolls (6pc)", 9.00, False),
    (3,  "Starters", "Satay with Peanut Sauce (1pc)", 3.00, False),
    (4,  "Starters", "Satay with Peanut Sauce (3pc)", 10.00, False),
    (5,  "Starters", "Deep Fried Tofu", 13.00, False),
    (6,  "Starters", "Gado Gado", 14.00, False),
    (7,  "Starters", "Roti Canai", 13.00, False),
    (8,  "Starters", "Breaded Cauliflower Bites", 13.00, False),
    (9,  "Starters", "Crispy Chicken Strips", 13.00, False),
    (10, "Starters", "Bean Curd Drumsticks", 13.00, False),
    (11, "Starters", "Fried Enoki Mushroom", 16.00, False),
    (12, "Soups", "Wonton Soup", 18.00, False),
    (13, "Soups", "Tom Yum Soup", 18.00, True),
    (14, "Soups", "Spicy Curry Noodle Soup", 18.00, True),
    (15, "Veggie & Tofu", "Padmanadi Vegetable Deluxe", 19.00, False),
    (16, "Veggie & Tofu", "Chili Green Beans", 19.00, False),
    (17, "Veggie & Tofu", "Spicy String Beans", 19.00, True),
    (18, "Veggie & Tofu", "King Oyster Mushroom Gaylan", 20.00, False),
    (19, "Veggie & Tofu", "Savory Eggplant", 18.00, False),
    (20, "Veggie & Tofu", "Spicy Coconut Eggplant", 18.00, True),
    (21, "Veggie & Tofu", "Mapo Tofu", 19.00, True),
    (22, "Veggie & Tofu", "Pan-Fried Broccoli & Cauliflower", 18.00, False),
    (23, "Veggie & Tofu", "Curry Vegetables & Tofu", 20.00, True),
    (24, "Veggie & Tofu", "Tempeh Pulau", 20.00, True),
    (25, "Veggie & Tofu", "Mushroom Tofu", 19.00, False),
    (26, "Veggie & Tofu", "Chili Tofu", 19.00, True),
    (27, "Plant-Based Meat", "Kung Pao Chicken", 20.00, False),
    (28, "Plant-Based Meat", "Ginger Beef", 21.00, False),
    (29, "Plant-Based Meat", "Dendeng", 20.00, False),
    (30, "Plant-Based Meat", "Sweet & Sour Chicken", 19.00, False),
    (31, "Plant-Based Meat", "Spicy Chicken", 19.00, True),
    (32, "Plant-Based Meat", "General Tao Chicken", 21.00, False),
    (33, "Plant-Based Meat", "Curry Chicken", 22.00, True),
    (34, "Plant-Based Meat", "Curry Mutton", 22.00, True),
    (35, "Plant-Based Meat", "Sweet & Sour Shrimp", 20.00, False),
    (36, "Plant-Based Meat", "Spicy Shrimp", 20.00, True),
    (37, "Plant-Based Meat", "Teriyaki Chicken", 19.00, False),
    (38, "Plant-Based Meat", "Rendang", 20.00, True),
    (39, "Rice & Noodles", "Nasi Goreng", 18.00, False),
    (40, "Rice & Noodles", "Bakmi Goreng", 19.00, False),
    (41, "Rice & Noodles", "Bihun Goreng", 18.00, False),
    (42, "Rice & Noodles", "Kwetiau Goreng", 19.00, False),
    (43, "Rice & Noodles", "Singapore Noodle", 19.00, True),
    (44, "Rice & Noodles", "Lemongrass Vermicelli Bowl", 20.00, False),
    (45, "Rice & Noodles", "Bali Buddha Bowl", 18.00, False),
    (46, "Sides", "Jasmine Rice", 2.75, False),
    (47, "Sides", "Coconut Rice", 3.00, False),
    (48, "Sides", "Brown Rice", 3.00, False),
    (49, "Lunch Special", "Lunch Special", 18.00, False),
    (50, "Coffee", "Americano", 4.50, False),
    (51, "Coffee", "Soy Latte", 5.50, False),
    (52, "Coffee", "Soy Mocha", 6.00, False),
    (53, "Coffee", "Vegan Iced Coffee", 5.50, False),
    (54, "Coffee", "Iced Brown Sugar Oat Latte", 6.50, False),
    (55, "Coffee", "Decaf Coffee", 4.50, False),
    (56, "Tea", "Organic Tea", 3.50, False),
    (57, "Tea", "Soy Chai Latte", 5.50, False),
    (58, "Tea", "London Fog", 5.50, False),
    (59, "Tea", "Hot Chocolate", 5.00, False),
    (60, "Tea", "Matcha Latte", 6.50, False),
    (61, "Tea", "Iced Oat Strawberry Matcha", 8.50, False),
    (62, "Drinks", "Iced Lychee", 7.50, False),
    (63, "Drinks", "Iced Pineapple", 7.50, False),
    (64, "Drinks", "Sparkling Yuzu", 8.50, False),
    (65, "Drinks", "Iced Passion Fruit Green Tea", 7.00, False),
    (66, "Drinks", "Assorted Soft Drinks", 2.50, False),
    (67, "Drinks", "Raspberry Lime Italian Soda", 6.50, False),
    (68, "Drinks", "Iced Blackberry Hibiscus Tea", 7.00, False),
    (69, "Desserts", "Cheesecake", 11.00, False),
    (70, "Desserts", "Panna Cotta", 9.00, False),
    (71, "Desserts", "Fried Banana with Coconut Ice Cream", 13.00, False),
    (72, "Desserts", "Vegan Ice Cream", 7.00, False),
    (73, "Desserts", "Chocolate Mousse", 9.00, False),
    (74, "Extras", "Extra Protein", 5.00, False),
    (75, "Extras", "Extra Tofu", 4.00, False),
    (76, "Extras", "Extra Veggies", 4.00, False),
    (77, "Extras", "Sub Coconut Rice (+1)", 1.00, False),
    (78, "Extras", "Sub Brown Rice (+1)", 1.00, False),
    (79, "Extras", "Add Noodles (Soup)", 3.00, False),
]

M = {m[0]: {"id": m[0], "cat": m[1], "name": m[2], "price": m[3], "spicy": m[4]} for m in MENU}

# item popularity weights (higher = ordered more often)
W = {
    28: 16, 33: 15, 32: 12, 49: 14, 27: 10, 30: 8, 37: 8, 38: 7, 34: 6,
    29: 5, 31: 7, 35: 5, 36: 5, 15: 7, 26: 6, 23: 7, 21: 5, 16: 4, 19: 4,
    18: 5, 25: 4, 24: 5, 22: 3, 17: 3, 20: 3, 12: 6, 13: 5, 14: 5,
    39: 8, 40: 5, 44: 7, 45: 7, 43: 5, 42: 4, 41: 4,
    1: 8, 2: 11, 4: 7, 9: 9, 7: 7, 3: 3, 5: 5, 6: 4, 8: 6, 10: 4, 11: 5,
    46: 14, 47: 8, 48: 6,
    66: 11, 51: 7, 56: 5, 62: 6, 53: 6, 50: 5, 60: 6, 57: 4, 54: 5,
    65: 4, 64: 4, 63: 4, 52: 3, 58: 3, 59: 3, 61: 4, 67: 3, 68: 3, 55: 2,
    69: 5, 71: 6, 70: 3, 73: 3, 72: 3,
    74: 3, 75: 3, 76: 2, 77: 4, 78: 3, 79: 2,
}

# ═══════════════════════════════════════════════════════════
# TABLES — Shops at Heritage strip-mall unit, ~55 seats
# ═══════════════════════════════════════════════════════════
TABLES = [
    (1,  2, "Window"),  (2,  2, "Window"),  (3,  2, "Window"),
    (4,  4, "Window"),  (5,  4, "Main"),    (6,  4, "Main"),
    (7,  4, "Main"),    (8,  4, "Main"),    (9,  6, "Main"),
    (10, 6, "Main"),    (11, 2, "Bar"),     (12, 2, "Bar"),
    (13, 8, "Back"),    (14, 4, "Back"),    (15, 2, "Back"),
]

# ═══════════════════════════════════════════════════════════
# STAFF
# ═══════════════════════════════════════════════════════════
STAFF = [
    (1,  "Ayu",    "Pratama",  "Server"),
    (2,  "Dimas",  "Wijaya",   "Server"),
    (3,  "Priya",  "Sharma",   "Server"),
    (4,  "Jordan", "Chen",     "Server"),
    (5,  "Emma",   "Olsen",    "Server"),
    (6,  "Kai",    "Tanaka",   "Server"),
    (7,  "Sari",   "Dewi",     "Server"),
    (8,  "Tyler",  "Brooks",   "Server"),
    (9,  "Mei",    "Nguyen",   "Host"),
    (10, "Rina",   "Hartono",  "Manager"),
]

LUNCH_SERVERS = [1, 2, 3, 4, 5, 9, 10]
DINNER_SERVERS = [2, 3, 4, 6, 7, 8, 10]
WEEKEND_SERVERS = [1, 2, 3, 4, 5, 6, 7, 8]

# ═══════════════════════════════════════════════════════════
# CARD HOLDER POOL — for tracking repeat customers
# ═══════════════════════════════════════════════════════════
def build_card_pool():
    used = set()
    pool = []
    brands = ["Visa"]*45 + ["Mastercard"]*30 + ["Interac Debit"]*20 + ["Amex"]*5

    def fresh_four():
        while True:
            n = f"{random.randint(0,9999):04d}"
            if n not in used:
                used.add(n)
                return n

    for _ in range(25):
        pool.append({"l4": fresh_four(), "brand": random.choice(brands),
                      "freq": "frequent", "remaining": random.randint(5, 12)})
    for _ in range(70):
        pool.append({"l4": fresh_four(), "brand": random.choice(brands),
                      "freq": "regular", "remaining": random.randint(2, 4)})
    for _ in range(450):
        pool.append({"l4": fresh_four(), "brand": random.choice(brands),
                      "freq": "rare", "remaining": 1})
    random.shuffle(pool)
    return pool

CARD_POOL = build_card_pool()
CARD_IDX = {"frequent": [], "regular": [], "rare": []}
for i, c in enumerate(CARD_POOL):
    CARD_IDX[c["freq"]].append(i)

def pick_card():
    r = random.random()
    if r < 0.08:
        bucket = "frequent"
    elif r < 0.28:
        bucket = "regular"
    else:
        bucket = "rare"
    candidates = [i for i in CARD_IDX[bucket] if CARD_POOL[i]["remaining"] > 0]
    if not candidates:
        candidates = [i for i in range(len(CARD_POOL)) if CARD_POOL[i]["remaining"] > 0]
    if not candidates:
        return "9999", "Visa"
    idx = random.choice(candidates)
    CARD_POOL[idx]["remaining"] -= 1
    return CARD_POOL[idx]["l4"], CARD_POOL[idx]["brand"]

# ═══════════════════════════════════════════════════════════
# TIMING — matches Google busy-times charts for this location
# ═══════════════════════════════════════════════════════════
HOUR_W = {11:4, 12:9, 13:7, 14:3, 15:2, 16:3, 17:7, 18:11, 19:11, 20:5}
HOURS = list(HOUR_W.keys())
HOUR_WEIGHTS = [HOUR_W[h] for h in HOURS]

DOW_MULT = {0:0.72, 1:0.78, 2:0.82, 3:0.88, 4:1.12, 5:1.22, 6:1.02}
BASE_ORDERS = 95

FREE_MODS = [
    "", "", "", "", "", "", "", "", "", "", "", "", "",
    "Extra Spicy", "Less Spicy", "No Peanuts", "No Cilantro",
    "Gluten Friendly", "No Onion", "Extra Sauce", "Sauce on Side",
    "No Mushrooms", "Allergy: Nuts",
]

LUNCH_ENTREES = [
    "Curried Tofu w/ Vegetables", "Chili Tofu", "Rendang", "Curry Chicken",
    "Padmanadi Veg Deluxe", "Savory Eggplant", "Sweet & Sour Nuggets",
    "Teriyaki Chicken", "Spicy Nuggets", "Kung Pao Chicken", "Ginger Beef",
    "Curry Mutton", "Chili Green Beans", "Sweet & Sour Chicken",
]

DISCOUNT_REASONS = [
    "Birthday 10%", "Manager comp", "Yelp check-in", "Loyalty",
    "Staff meal 50%", "Google review promo",
]

DELIVERY_PLATFORMS = ["SkipTheDishes", "DoorDash", "UberEats"]

# ═══════════════════════════════════════════════════════════
# ITEM SELECTION LOGIC
# ═══════════════════════════════════════════════════════════
def by_cat(*cats):
    return [m for m in MENU if m[1] in cats]

STARTERS   = by_cat("Starters")
SOUPS      = by_cat("Soups")
VEG_MAINS  = by_cat("Veggie & Tofu")
MEAT_MAINS = by_cat("Plant-Based Meat")
RICE_NOOD  = by_cat("Rice & Noodles")
SIDES      = by_cat("Sides")
BEVERAGES  = by_cat("Coffee", "Tea", "Drinks")
DESSERTS   = by_cat("Desserts")
ALL_MAINS  = VEG_MAINS + MEAT_MAINS + RICE_NOOD + SOUPS

def weighted_pick(pool, k=1):
    ws = [W.get(m[0], 3) for m in pool]
    return random.choices(pool, weights=ws, k=k)

def build_items(party_size, hour):
    is_lunch = 11 <= hour <= 13
    items = []  # list of (menu_id, qty, modifier_text)

    for _ in range(party_size):
        if is_lunch and random.random() < 0.38:
            entree = random.choice(LUNCH_ENTREES)
            items.append((49, 1, f"Entree: {entree}"))
            if random.random() < 0.12:
                items.append((77 if random.random() < 0.55 else 78, 1, ""))
        else:
            main = weighted_pick(ALL_MAINS)[0]
            mod = random.choice(FREE_MODS)
            items.append((main[0], 1, mod))

            if main[1] not in ("Rice & Noodles", "Soups") and random.random() < 0.48:
                rice = weighted_pick(SIDES)[0]
                items.append((rice[0], 1, ""))

            if main[1] == "Soups" and random.random() < 0.25:
                items.append((79, 1, ""))

            if random.random() < 0.08:
                extras = [m for m in MENU if m[0] in (74,75,76)]
                items.append((random.choice(extras)[0], 1, ""))

        if random.random() < 0.58:
            bev = weighted_pick(BEVERAGES)[0]
            items.append((bev[0], 1, ""))

    app_chance = min(0.22 + (party_size - 1) * 0.10, 0.65)
    if random.random() < app_chance:
        items.append((weighted_pick(STARTERS)[0][0], 1, ""))
        if party_size >= 4 and random.random() < 0.35:
            s2 = weighted_pick(STARTERS)[0]
            items.append((s2[0], 1, ""))

    if random.random() < 0.12 * min(party_size, 3):
        nd = min(random.randint(1, 2), party_size)
        for _ in range(nd):
            items.append((weighted_pick(DESSERTS)[0][0], 1, ""))

    return items

# ═══════════════════════════════════════════════════════════
# MAIN GENERATION LOOP
# ═══════════════════════════════════════════════════════════
orders_rows = []
items_rows = []
order_id = 0
item_id = 0

start = datetime(2026, 5, 1)

for day_offset in range(31):
    date = start + timedelta(days=day_offset)
    dow = date.weekday()
    n_orders = int(BASE_ORDERS * DOW_MULT[dow] * random.uniform(0.88, 1.12))
    n_orders = max(65, min(130, n_orders))

    daily_order_num = 0
    is_weekend = dow >= 4

    order_hours = random.choices(HOURS, weights=HOUR_WEIGHTS, k=n_orders)
    order_hours.sort()

    for hour in order_hours:
        order_id += 1
        daily_order_num += 1
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        created = date.replace(hour=hour, minute=minute, second=second)

        # order type
        r = random.random()
        if r < 0.62:
            otype = "dine_in"
        elif r < 0.78:
            otype = "takeout"
        else:
            otype = "delivery"

        # party size
        if otype == "dine_in":
            ps_r = random.random()
            if ps_r < 0.12:
                party = 1
            elif ps_r < 0.52:
                party = 2
            elif ps_r < 0.72:
                party = 3
            elif ps_r < 0.90:
                party = 4
            elif ps_r < 0.96:
                party = 5
            else:
                party = random.randint(6, 8)
        else:
            party = random.choices([1, 2, 3, 4], weights=[40, 35, 15, 10])[0]

        # table assignment
        if otype == "dine_in":
            suitable = [t for t in TABLES if t[1] >= party]
            if not suitable:
                suitable = [TABLES[-1]]
            tbl = random.choice(suitable)
            table_num = tbl[0]
        else:
            table_num = None

        # server
        if is_weekend:
            pool = WEEKEND_SERVERS
        elif hour < 16:
            pool = LUNCH_SERVERS
        else:
            pool = DINNER_SERVERS
        server_id = random.choice(pool)

        # delivery platform
        platform = random.choice(DELIVERY_PLATFORMS) if otype == "delivery" else None

        # closed_at
        if otype == "dine_in":
            close_min = random.randint(35, 75)
        elif otype == "takeout":
            close_min = random.randint(12, 30)
        else:
            close_min = random.randint(5, 15)
        closed = created + timedelta(minutes=close_min)

        # generate items
        line_items = build_items(party, hour)

        # compute subtotal
        subtotal = sum(M[mid]["price"] * qty for mid, qty, _ in line_items)
        subtotal = round(subtotal, 2)

        # discount
        if random.random() < 0.035:
            disc_reason = random.choice(DISCOUNT_REASONS)
            if "10%" in disc_reason:
                disc_amt = round(subtotal * 0.10, 2)
            elif "50%" in disc_reason:
                disc_amt = round(subtotal * 0.50, 2)
            else:
                disc_amt = round(random.choice([5.0, 10.0, subtotal * 0.15]), 2)
        else:
            disc_reason = ""
            disc_amt = 0.0

        after_disc = round(subtotal - disc_amt, 2)
        gst = round(after_disc * 0.05, 2)

        # tip
        if otype == "dine_in":
            tip_pct = random.choices(
                [0, 0.10, 0.15, 0.18, 0.20, 0.25],
                weights=[3, 5, 25, 30, 30, 7], k=1
            )[0]
            tip = round(after_disc * tip_pct, 2)
        elif otype == "takeout":
            tip_pct = random.choices([0, 0.05, 0.10, 0.15], weights=[50, 20, 20, 10], k=1)[0]
            tip = round(after_disc * tip_pct, 2)
        else:
            tip = 0.0

        total = round(after_disc + gst + tip, 2)

        # payment
        pr = random.random()
        if pr < 0.42:
            pay_method = "Credit"
        elif pr < 0.70:
            pay_method = "Debit"
        elif pr < 0.85:
            pay_method = "Cash"
        else:
            pay_method = "Mobile"

        if pay_method in ("Credit", "Debit", "Mobile"):
            card_l4, card_brand = pick_card()
            if pay_method == "Debit":
                card_brand = "Interac Debit"
            elif pay_method == "Mobile":
                card_brand = random.choice(["Apple Pay", "Google Pay"])
        else:
            card_l4 = ""
            card_brand = ""

        # status
        if random.random() < 0.018:
            status = "voided"
            tip = 0
            total = 0
        elif random.random() < 0.005:
            status = "refunded"
        else:
            status = "completed"

        orders_rows.append({
            "order_id": order_id,
            "order_number": f"#{daily_order_num:03d}",
            "order_date": date.strftime("%Y-%m-%d"),
            "created_at": created.strftime("%Y-%m-%d %H:%M:%S"),
            "closed_at": closed.strftime("%Y-%m-%d %H:%M:%S"),
            "order_type": otype,
            "table_number": table_num if table_num else "",
            "party_size": party,
            "server_id": server_id,
            "subtotal": f"{subtotal:.2f}",
            "discount_amount": f"{disc_amt:.2f}",
            "discount_reason": disc_reason,
            "gst": f"{gst:.2f}",
            "tip": f"{tip:.2f}",
            "total": f"{total:.2f}",
            "payment_method": pay_method,
            "card_brand": card_brand,
            "card_last_four": card_l4,
            "delivery_platform": platform if platform else "",
            "status": status,
        })

        for mid, qty, mod in line_items:
            item_id += 1
            items_rows.append({
                "order_item_id": item_id,
                "order_id": order_id,
                "menu_item_id": mid,
                "item_name": M[mid]["name"],
                "category": M[mid]["cat"],
                "quantity": qty,
                "unit_price": f"{M[mid]['price']:.2f}",
                "modifier": mod,
                "line_total": f"{M[mid]['price'] * qty:.2f}",
            })

# ═══════════════════════════════════════════════════════════
# WRITE CSVs
# ═══════════════════════════════════════════════════════════
def write_csv(fname, rows, fieldnames):
    path = os.path.join(OUT, fname)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"  {fname}: {len(rows):,} rows")

print(f"\nPadmanadi Calgary POS Data — May 2026")
print(f"{'='*45}", flush=True)

write_csv("menu_items.csv",
    [{"item_id": m[0], "category": m[1], "name": m[2], "price": f"{m[3]:.2f}", "is_spicy": m[4]} for m in MENU],
    ["item_id", "category", "name", "price", "is_spicy"])

write_csv("restaurant_tables.csv",
    [{"table_number": t[0], "seats": t[1], "section": t[2]} for t in TABLES],
    ["table_number", "seats", "section"])

write_csv("staff.csv",
    [{"staff_id": s[0], "first_name": s[1], "last_name": s[2], "role": s[3]} for s in STAFF],
    ["staff_id", "first_name", "last_name", "role"])

write_csv("orders.csv", orders_rows,
    ["order_id", "order_number", "order_date", "created_at", "closed_at",
     "order_type", "table_number", "party_size", "server_id",
     "subtotal", "discount_amount", "discount_reason", "gst", "tip", "total",
     "payment_method", "card_brand", "card_last_four", "delivery_platform", "status"])

write_csv("order_items.csv", items_rows,
    ["order_item_id", "order_id", "menu_item_id", "item_name", "category",
     "quantity", "unit_price", "modifier", "line_total"])

# ═══════════════════════════════════════════════════════════
# SUMMARY STATS
# ═══════════════════════════════════════════════════════════
completed = [o for o in orders_rows if o["status"] == "completed"]
rev = sum(float(o["total"]) for o in completed)
avg = rev / len(completed) if completed else 0
dine = sum(1 for o in completed if o["order_type"] == "dine_in")
take = sum(1 for o in completed if o["order_type"] == "takeout")
deliv = sum(1 for o in completed if o["order_type"] == "delivery")
cards_used = set(o["card_last_four"] for o in completed if o["card_last_four"])
repeat = sum(1 for l4 in cards_used
             if sum(1 for o in completed if o["card_last_four"] == l4) >= 2)

print(f"\n{'-'*45}")
print(f"Total orders:       {len(orders_rows):,}")
print(f"Completed:          {len(completed):,}")
print(f"Total revenue:      ${rev:,.2f}")
print(f"Avg ticket:         ${avg:,.2f}")
print(f"Dine-in / Take / Del: {dine} / {take} / {deliv}")
print(f"Unique cards:       {len(cards_used)}")
print(f"Repeat card holders: {repeat}")
print(f"Total line items:   {len(items_rows):,}")
print(f"\nFiles written to: {OUT}")
