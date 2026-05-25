#!/usr/bin/env python3
"""Fix menu prices and generate recipe/ingredient data for Padmanadi dashboard."""

import csv, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# ═══════════════════════════════════════════════════════════
# 1. Fix menu_items.csv prices and add missing items
# ═══════════════════════════════════════════════════════════
rows = []
with open(os.path.join(OUT, "menu_items.csv"), encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        iid = int(r["item_id"])
        if iid == 5:   r["price"] = "12.00"   # Deep Fried Tofu
        if iid == 8:   r["price"] = "12.00"   # Breaded Cauliflower Bites
        if iid == 12:  r["price"] = "17.00"   # Wonton Soup
        if iid == 13:  r["price"] = "17.00"   # Tom Yum Soup
        rows.append(r)

rows.append({"item_id": "80", "category": "Soups", "name": "Vegetable Combo Soup",
             "price": "17.00", "is_spicy": "False"})

with open(os.path.join(OUT, "menu_items.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["item_id", "category", "name", "price", "is_spicy"])
    w.writeheader()
    w.writerows(rows)
print(f"menu_items.csv: {len(rows)} items (fixed prices, added Vegetable Combo Soup)")

# ═══════════════════════════════════════════════════════════
# 2. Generate recipe_ingredients.csv
# ═══════════════════════════════════════════════════════════
# (menu_item_id, ingredient, ingredient_category, qty, unit, prep_group, shelf_life, complexity)
R = []
def add(mid, name, ingredients):
    for ing in ingredients:
        R.append({"menu_item_id": mid, "menu_item_name": name,
                  "ingredient": ing[0], "ingredient_category": ing[1],
                  "quantity_per_item": ing[2], "unit": ing[3],
                  "prep_group": ing[4], "shelf_life_days": ing[5],
                  "complexity_weight": ing[6]})

# ── Starters ──────────────────────────────────────────────
add(1, "Vegetable Spring Rolls (3pc)", [
    ("spring roll wrappers", "Starches", 3, "pc", "Fry Station", 90, 2),
    ("cabbage", "Produce", 60, "g", "Fry Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Fry Station", 14, 1),
    ("glass noodles", "Starches", 20, "g", "Fry Station", 365, 1),
    ("cooking oil", "Oils", 150, "ml", "Fry Station", 180, 1),
    ("plum dipping sauce", "Sauces", 30, "ml", "Sauce Prep", 60, 2),
])
add(2, "Vegetable Spring Rolls (6pc)", [
    ("spring roll wrappers", "Starches", 6, "pc", "Fry Station", 90, 2),
    ("cabbage", "Produce", 120, "g", "Fry Station", 7, 1),
    ("carrots", "Produce", 80, "g", "Fry Station", 14, 1),
    ("glass noodles", "Starches", 40, "g", "Fry Station", 365, 1),
    ("cooking oil", "Oils", 250, "ml", "Fry Station", 180, 1),
    ("plum dipping sauce", "Sauces", 60, "ml", "Sauce Prep", 60, 2),
])
add(3, "Satay with Peanut Sauce (1pc)", [
    ("vegan chicken", "Proteins", 50, "g", "Wok Station", 5, 2),
    ("peanut sauce", "Sauces", 30, "ml", "Sauce Prep", 7, 3),
    ("bamboo skewers", "Supplies", 1, "pc", "Wok Station", 365, 1),
    ("satay marinade", "Sauces", 15, "ml", "Sauce Prep", 14, 2),
])
add(4, "Satay with Peanut Sauce (3pc)", [
    ("vegan chicken", "Proteins", 150, "g", "Wok Station", 5, 2),
    ("peanut sauce", "Sauces", 60, "ml", "Sauce Prep", 7, 3),
    ("bamboo skewers", "Supplies", 3, "pc", "Wok Station", 365, 1),
    ("satay marinade", "Sauces", 40, "ml", "Sauce Prep", 14, 2),
])
add(5, "Deep Fried Tofu", [
    ("firm tofu", "Proteins", 200, "g", "Fry Station", 7, 1),
    ("cooking oil", "Oils", 200, "ml", "Fry Station", 180, 1),
    ("kecap manis", "Sauces", 40, "ml", "Sauce Prep", 180, 1),
])
add(6, "Gado Gado", [
    ("firm tofu", "Proteins", 80, "g", "Cold Assembly", 7, 2),
    ("tempeh", "Proteins", 60, "g", "Cold Assembly", 5, 2),
    ("cabbage", "Produce", 60, "g", "Cold Assembly", 7, 1),
    ("bean sprouts", "Produce", 40, "g", "Cold Assembly", 3, 1),
    ("peanut sauce", "Sauces", 80, "ml", "Sauce Prep", 7, 3),
    ("rice cake", "Starches", 40, "g", "Cold Assembly", 5, 1),
    ("cucumber", "Produce", 40, "g", "Cold Assembly", 7, 1),
])
add(7, "Roti Canai", [
    ("roti dough", "Starches", 150, "g", "Wok Station", 3, 3),
    ("curry dipping sauce", "Sauces", 60, "ml", "Sauce Prep", 7, 3),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(8, "Breaded Cauliflower Bites", [
    ("cauliflower", "Produce", 200, "g", "Fry Station", 7, 2),
    ("batter mix", "Starches", 60, "g", "Fry Station", 90, 1),
    ("cooking oil", "Oils", 200, "ml", "Fry Station", 180, 1),
    ("mango chili dip", "Sauces", 40, "ml", "Sauce Prep", 7, 3),
])
add(9, "Crispy Chicken Strips", [
    ("vegan chicken", "Proteins", 180, "g", "Fry Station", 5, 2),
    ("batter mix", "Starches", 50, "g", "Fry Station", 90, 1),
    ("cooking oil", "Oils", 200, "ml", "Fry Station", 180, 1),
    ("hot sauce", "Sauces", 30, "ml", "Sauce Prep", 30, 2),
])
add(10, "Bean Curd Drumsticks", [
    ("bean curd sheets", "Proteins", 160, "g", "Fry Station", 7, 3),
    ("seasoning blend", "Aromatics", 10, "g", "Fry Station", 180, 1),
    ("hot sauce", "Sauces", 30, "ml", "Sauce Prep", 30, 2),
    ("bamboo skewers", "Supplies", 3, "pc", "Fry Station", 365, 1),
])
add(11, "Fried Enoki Mushroom", [
    ("enoki mushrooms", "Produce", 200, "g", "Fry Station", 5, 2),
    ("tempura batter", "Starches", 60, "g", "Fry Station", 90, 1),
    ("cooking oil", "Oils", 200, "ml", "Fry Station", 180, 1),
    ("miso aioli", "Sauces", 40, "ml", "Sauce Prep", 7, 3),
])

# ── Soups ─────────────────────────────────────────────────
add(12, "Wonton Soup", [
    ("wonton wrappers", "Starches", 8, "pc", "Soup Station", 7, 3),
    ("wonton filling", "Proteins", 100, "g", "Soup Station", 3, 4),
    ("carrots", "Produce", 40, "g", "Soup Station", 14, 1),
    ("bok choy", "Produce", 60, "g", "Soup Station", 5, 1),
    ("broccoli", "Produce", 50, "g", "Soup Station", 7, 1),
    ("mushrooms", "Produce", 40, "g", "Soup Station", 5, 1),
    ("vegan broth", "Sauces", 400, "ml", "Soup Station", 5, 2),
])
add(13, "Tom Yum Soup", [
    ("lemongrass", "Aromatics", 2, "stalks", "Soup Station", 14, 2),
    ("lime leaves", "Aromatics", 4, "pc", "Soup Station", 7, 1),
    ("galangal", "Aromatics", 15, "g", "Soup Station", 14, 2),
    ("vegan seafood mix", "Proteins", 100, "g", "Soup Station", 5, 2),
    ("mushrooms", "Produce", 60, "g", "Soup Station", 5, 1),
    ("firm tofu", "Proteins", 80, "g", "Soup Station", 7, 1),
    ("tom yum paste", "Sauces", 40, "g", "Sauce Prep", 60, 3),
    ("seasonal vegetables", "Produce", 80, "g", "Soup Station", 5, 1),
])
add(14, "Spicy Curry Noodle Soup", [
    ("hakka noodles", "Starches", 180, "g", "Soup Station", 3, 2),
    ("red curry paste", "Sauces", 40, "g", "Sauce Prep", 60, 3),
    ("coconut milk", "Dairy Alternatives", 200, "ml", "Soup Station", 14, 1),
    ("fried tofu", "Proteins", 80, "g", "Fry Station", 7, 2),
    ("oyster mushroom", "Produce", 60, "g", "Soup Station", 5, 1),
    ("baby corn", "Produce", 40, "g", "Soup Station", 14, 1),
    ("bean sprouts", "Produce", 40, "g", "Soup Station", 3, 1),
    ("cilantro", "Aromatics", 5, "g", "Soup Station", 5, 1),
])
add(80, "Vegetable Combo Soup", [
    ("vegan broth", "Sauces", 400, "ml", "Soup Station", 5, 2),
    ("mixed vegetables", "Produce", 150, "g", "Soup Station", 5, 1),
    ("firm tofu", "Proteins", 60, "g", "Soup Station", 7, 1),
    ("mushrooms", "Produce", 40, "g", "Soup Station", 5, 1),
    ("napa cabbage", "Produce", 50, "g", "Soup Station", 7, 1),
])

# ── Veggie & Tofu ─────────────────────────────────────────
add(15, "Padmanadi Vegetable Deluxe", [
    ("firm tofu", "Proteins", 100, "g", "Wok Station", 7, 2),
    ("mixed vegetables", "Produce", 200, "g", "Wok Station", 5, 1),
    ("stir-fry sauce", "Sauces", 40, "ml", "Sauce Prep", 14, 2),
    ("garlic", "Aromatics", 10, "g", "Wok Station", 30, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(16, "Chili Green Beans", [
    ("green beans", "Produce", 200, "g", "Wok Station", 7, 1),
    ("black bean sauce", "Sauces", 50, "ml", "Sauce Prep", 60, 2),
    ("garlic", "Aromatics", 10, "g", "Wok Station", 30, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(17, "Spicy String Beans", [
    ("green beans", "Produce", 200, "g", "Wok Station", 7, 2),
    ("tomatoes", "Produce", 60, "g", "Wok Station", 7, 1),
    ("chinese radish", "Produce", 40, "g", "Wok Station", 14, 1),
    ("coconut sauce", "Sauces", 60, "ml", "Sauce Prep", 7, 3),
    ("chili", "Aromatics", 5, "g", "Wok Station", 14, 1),
])
add(18, "King Oyster Mushroom Gaylan", [
    ("gaylan (chinese broccoli)", "Produce", 150, "g", "Wok Station", 5, 2),
    ("king oyster mushroom", "Produce", 120, "g", "Wok Station", 5, 2),
    ("ginger", "Aromatics", 15, "g", "Wok Station", 21, 1),
    ("oyster mushroom sauce", "Sauces", 50, "ml", "Sauce Prep", 30, 2),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(19, "Savory Eggplant", [
    ("chinese eggplant", "Produce", 200, "g", "Wok Station", 7, 2),
    ("bell peppers", "Produce", 60, "g", "Wok Station", 7, 1),
    ("sweet chili sauce", "Sauces", 50, "ml", "Sauce Prep", 60, 2),
    ("cooking oil", "Oils", 40, "ml", "Wok Station", 180, 1),
])
add(20, "Spicy Coconut Eggplant", [
    ("chinese eggplant", "Produce", 200, "g", "Wok Station", 7, 2),
    ("tomatoes", "Produce", 60, "g", "Wok Station", 7, 1),
    ("bell peppers", "Produce", 50, "g", "Wok Station", 7, 1),
    ("coconut sauce", "Sauces", 60, "ml", "Sauce Prep", 7, 3),
    ("chili", "Aromatics", 5, "g", "Wok Station", 14, 1),
])
add(21, "Mapo Tofu", [
    ("silken tofu", "Proteins", 200, "g", "Wok Station", 5, 2),
    ("vegan ground meat", "Proteins", 80, "g", "Wok Station", 5, 2),
    ("mixed vegetables", "Produce", 60, "g", "Wok Station", 5, 1),
    ("mushrooms", "Produce", 40, "g", "Wok Station", 5, 1),
    ("chili bean paste", "Sauces", 30, "g", "Sauce Prep", 180, 3),
    ("sichuan peppercorn", "Aromatics", 2, "g", "Wok Station", 180, 1),
])
add(22, "Pan-Fried Broccoli & Cauliflower", [
    ("broccoli", "Produce", 150, "g", "Wok Station", 7, 1),
    ("cauliflower", "Produce", 150, "g", "Wok Station", 7, 1),
    ("soy sauce", "Sauces", 20, "ml", "Wok Station", 365, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(23, "Curry Vegetables & Tofu", [
    ("firm tofu", "Proteins", 100, "g", "Wok Station", 7, 2),
    ("broccoli", "Produce", 50, "g", "Wok Station", 7, 1),
    ("cauliflower", "Produce", 50, "g", "Wok Station", 7, 1),
    ("cabbage", "Produce", 40, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("baby corn", "Produce", 30, "g", "Wok Station", 14, 1),
    ("bell peppers", "Produce", 40, "g", "Wok Station", 7, 1),
    ("chinese eggplant", "Produce", 40, "g", "Wok Station", 7, 1),
    ("yellow coconut curry sauce", "Sauces", 120, "ml", "Sauce Prep", 5, 4),
])
add(24, "Tempeh Pulau", [
    ("tempeh", "Proteins", 150, "g", "Wok Station", 5, 3),
    ("potatoes", "Produce", 100, "g", "Wok Station", 21, 1),
    ("mixed vegetables", "Produce", 80, "g", "Wok Station", 5, 1),
    ("island spice blend", "Aromatics", 15, "g", "Sauce Prep", 90, 3),
    ("coconut milk", "Dairy Alternatives", 60, "ml", "Wok Station", 14, 1),
])
add(25, "Mushroom Tofu", [
    ("fried tofu", "Proteins", 150, "g", "Fry Station", 7, 2),
    ("button mushrooms", "Produce", 60, "g", "Wok Station", 5, 1),
    ("shimeji mushrooms", "Produce", 60, "g", "Wok Station", 5, 2),
    ("oyster mushroom sauce", "Sauces", 50, "ml", "Sauce Prep", 30, 2),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(26, "Chili Tofu", [
    ("fried tofu", "Proteins", 150, "g", "Fry Station", 7, 2),
    ("chili peppers", "Produce", 30, "g", "Wok Station", 7, 1),
    ("baby corn", "Produce", 40, "g", "Wok Station", 14, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("green peas", "Produce", 30, "g", "Wok Station", 365, 1),
    ("tomatoes", "Produce", 40, "g", "Wok Station", 7, 1),
    ("chili sauce", "Sauces", 50, "ml", "Sauce Prep", 30, 2),
])

# ── Plant-Based Meat ──────────────────────────────────────
add(27, "Kung Pao Chicken", [
    ("vegan chicken", "Proteins", 180, "g", "Wok Station", 5, 2),
    ("celery", "Produce", 50, "g", "Wok Station", 10, 1),
    ("bell peppers", "Produce", 50, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("cashews", "Nuts & Seeds", 25, "g", "Wok Station", 90, 1),
    ("kung pao sauce", "Sauces", 50, "ml", "Sauce Prep", 14, 3),
])
add(28, "Ginger Beef", [
    ("vegan beef strips", "Proteins", 200, "g", "Wok Station", 5, 3),
    ("bell peppers", "Produce", 60, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 60, "g", "Wok Station", 14, 1),
    ("ginger sauce", "Sauces", 60, "ml", "Sauce Prep", 7, 3),
    ("ginger", "Aromatics", 20, "g", "Wok Station", 21, 1),
    ("cooking oil", "Oils", 40, "ml", "Wok Station", 180, 1),
])
add(29, "Dendeng", [
    ("vegan beef strips", "Proteins", 200, "g", "Fry Station", 5, 3),
    ("kecap manis", "Sauces", 40, "ml", "Sauce Prep", 180, 2),
    ("shallots", "Aromatics", 20, "g", "Fry Station", 30, 1),
    ("cooking oil", "Oils", 100, "ml", "Fry Station", 180, 1),
])
add(30, "Sweet & Sour Chicken", [
    ("vegan chicken", "Proteins", 180, "g", "Wok Station", 5, 2),
    ("pineapple", "Produce", 50, "g", "Wok Station", 5, 1),
    ("green peas", "Produce", 30, "g", "Wok Station", 365, 1),
    ("cucumber", "Produce", 30, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("bell peppers", "Produce", 50, "g", "Wok Station", 7, 1),
    ("sweet & sour sauce", "Sauces", 60, "ml", "Sauce Prep", 14, 2),
])
add(31, "Spicy Chicken", [
    ("vegan chicken", "Proteins", 180, "g", "Wok Station", 5, 2),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("baby corn", "Produce", 40, "g", "Wok Station", 14, 1),
    ("green peas", "Produce", 30, "g", "Wok Station", 365, 1),
    ("bell peppers", "Produce", 40, "g", "Wok Station", 7, 1),
    ("tomatoes", "Produce", 40, "g", "Wok Station", 7, 1),
    ("chili sauce", "Sauces", 50, "ml", "Sauce Prep", 30, 2),
])
add(32, "General Tao Chicken", [
    ("vegan chicken", "Proteins", 200, "g", "Wok Station", 5, 3),
    ("cucumber", "Produce", 40, "g", "Wok Station", 7, 1),
    ("bell peppers", "Produce", 50, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("general tao sauce", "Sauces", 60, "ml", "Sauce Prep", 14, 3),
    ("sesame seeds", "Nuts & Seeds", 5, "g", "Wok Station", 180, 1),
])
add(33, "Curry Chicken", [
    ("vegan chicken", "Proteins", 180, "g", "Wok Station", 5, 3),
    ("potatoes", "Produce", 80, "g", "Wok Station", 21, 1),
    ("mixed vegetables", "Produce", 80, "g", "Wok Station", 5, 1),
    ("yellow coconut curry sauce", "Sauces", 150, "ml", "Sauce Prep", 5, 4),
    ("coconut milk", "Dairy Alternatives", 100, "ml", "Wok Station", 14, 1),
])
add(34, "Curry Mutton", [
    ("vegan mutton", "Proteins", 180, "g", "Wok Station", 5, 3),
    ("potatoes", "Produce", 80, "g", "Wok Station", 21, 1),
    ("mixed vegetables", "Produce", 80, "g", "Wok Station", 5, 1),
    ("yellow coconut curry sauce", "Sauces", 150, "ml", "Sauce Prep", 5, 4),
    ("coconut milk", "Dairy Alternatives", 100, "ml", "Wok Station", 14, 1),
])
add(35, "Sweet & Sour Shrimp", [
    ("vegan shrimp", "Proteins", 180, "g", "Fry Station", 5, 3),
    ("batter mix", "Starches", 40, "g", "Fry Station", 90, 1),
    ("bell peppers", "Produce", 50, "g", "Wok Station", 7, 1),
    ("green peas", "Produce", 30, "g", "Wok Station", 365, 1),
    ("pineapple", "Produce", 50, "g", "Wok Station", 5, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("sweet & sour sauce", "Sauces", 60, "ml", "Sauce Prep", 14, 2),
])
add(36, "Spicy Shrimp", [
    ("vegan shrimp", "Proteins", 180, "g", "Fry Station", 5, 3),
    ("batter mix", "Starches", 40, "g", "Fry Station", 90, 1),
    ("baby corn", "Produce", 40, "g", "Wok Station", 14, 1),
    ("chili peppers", "Produce", 30, "g", "Wok Station", 7, 1),
    ("green peas", "Produce", 30, "g", "Wok Station", 365, 1),
    ("tomatoes", "Produce", 40, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("chili sauce", "Sauces", 50, "ml", "Sauce Prep", 30, 2),
])
add(37, "Teriyaki Chicken", [
    ("vegan chicken", "Proteins", 180, "g", "Wok Station", 5, 2),
    ("celery", "Produce", 50, "g", "Wok Station", 10, 1),
    ("bell peppers", "Produce", 50, "g", "Wok Station", 7, 1),
    ("carrots", "Produce", 40, "g", "Wok Station", 14, 1),
    ("teriyaki sauce", "Sauces", 50, "ml", "Sauce Prep", 30, 2),
])
add(38, "Rendang", [
    ("vegan beef strips", "Proteins", 200, "g", "Wok Station", 5, 4),
    ("potatoes", "Produce", 80, "g", "Wok Station", 21, 1),
    ("coconut milk", "Dairy Alternatives", 150, "ml", "Wok Station", 14, 1),
    ("galangal", "Aromatics", 15, "g", "Wok Station", 14, 2),
    ("lemongrass", "Aromatics", 2, "stalks", "Wok Station", 14, 2),
    ("lime leaves", "Aromatics", 3, "pc", "Wok Station", 7, 1),
    ("rendang paste", "Sauces", 50, "g", "Sauce Prep", 30, 4),
])

# ── Rice & Noodles ────────────────────────────────────────
add(39, "Nasi Goreng", [
    ("jasmine rice", "Starches", 250, "g", "Rice Station", 2, 2),
    ("vegan chicken", "Proteins", 80, "g", "Wok Station", 5, 2),
    ("mixed diced vegetables", "Produce", 80, "g", "Wok Station", 5, 1),
    ("kecap manis", "Sauces", 30, "ml", "Wok Station", 180, 1),
    ("garlic", "Aromatics", 10, "g", "Wok Station", 30, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(40, "Bakmi Goreng", [
    ("egg-style noodles", "Starches", 200, "g", "Rice Station", 3, 2),
    ("vegan chicken", "Proteins", 80, "g", "Wok Station", 5, 2),
    ("shredded vegetables", "Produce", 100, "g", "Wok Station", 5, 1),
    ("kecap manis", "Sauces", 30, "ml", "Wok Station", 180, 1),
    ("garlic", "Aromatics", 10, "g", "Wok Station", 30, 1),
])
add(41, "Bihun Goreng", [
    ("rice vermicelli", "Starches", 180, "g", "Rice Station", 180, 1),
    ("firm tofu", "Proteins", 80, "g", "Wok Station", 7, 1),
    ("shredded vegetables", "Produce", 100, "g", "Wok Station", 5, 1),
    ("soy sauce", "Sauces", 20, "ml", "Wok Station", 365, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(42, "Kwetiau Goreng", [
    ("flat rice noodles", "Starches", 200, "g", "Rice Station", 3, 2),
    ("vegan chicken", "Proteins", 80, "g", "Wok Station", 5, 2),
    ("shredded vegetables", "Produce", 100, "g", "Wok Station", 5, 1),
    ("soy sauce", "Sauces", 20, "ml", "Wok Station", 365, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(43, "Singapore Noodle", [
    ("rice vermicelli", "Starches", 180, "g", "Rice Station", 180, 2),
    ("vegan shrimp", "Proteins", 80, "g", "Wok Station", 5, 2),
    ("curry powder", "Aromatics", 10, "g", "Wok Station", 180, 2),
    ("mixed vegetables", "Produce", 100, "g", "Wok Station", 5, 1),
    ("cooking oil", "Oils", 30, "ml", "Wok Station", 180, 1),
])
add(44, "Lemongrass Vermicelli Bowl", [
    ("rice vermicelli", "Starches", 150, "g", "Rice Station", 180, 1),
    ("vegan chicken", "Proteins", 80, "g", "Fry Station", 5, 2),
    ("firm tofu", "Proteins", 60, "g", "Fry Station", 7, 1),
    ("spring roll wrappers", "Starches", 2, "pc", "Fry Station", 90, 2),
    ("romaine lettuce", "Produce", 40, "g", "Cold Assembly", 5, 1),
    ("cucumber", "Produce", 30, "g", "Cold Assembly", 7, 1),
    ("carrots", "Produce", 30, "g", "Cold Assembly", 14, 1),
    ("vegan fish sauce", "Sauces", 30, "ml", "Sauce Prep", 180, 2),
])
add(45, "Bali Buddha Bowl", [
    ("brown rice", "Starches", 200, "g", "Rice Station", 2, 1),
    ("purple cabbage", "Produce", 40, "g", "Cold Assembly", 10, 1),
    ("spinach", "Produce", 40, "g", "Cold Assembly", 5, 1),
    ("tempeh", "Proteins", 60, "g", "Cold Assembly", 5, 2),
    ("bean sprouts", "Produce", 30, "g", "Cold Assembly", 3, 1),
    ("carrots", "Produce", 30, "g", "Cold Assembly", 14, 1),
    ("firm tofu", "Proteins", 60, "g", "Cold Assembly", 7, 1),
    ("peanut dressing", "Sauces", 40, "ml", "Sauce Prep", 7, 2),
])

# ── Sides ─────────────────────────────────────────────────
add(46, "Jasmine Rice", [
    ("jasmine rice", "Starches", 200, "g", "Rice Station", 365, 1),
])
add(47, "Coconut Rice", [
    ("jasmine rice", "Starches", 200, "g", "Rice Station", 365, 1),
    ("coconut milk", "Dairy Alternatives", 50, "ml", "Rice Station", 14, 2),
])
add(48, "Brown Rice", [
    ("brown rice", "Starches", 200, "g", "Rice Station", 365, 1),
])

# ── Lunch Special ─────────────────────────────────────────
add(49, "Lunch Special", [
    ("jasmine rice", "Starches", 200, "g", "Rice Station", 365, 1),
    ("spring roll wrappers", "Starches", 2, "pc", "Fry Station", 90, 2),
    ("cabbage", "Produce", 40, "g", "Fry Station", 7, 1),
    ("carrots", "Produce", 25, "g", "Fry Station", 14, 1),
    ("cooking oil", "Oils", 100, "ml", "Fry Station", 180, 1),
    ("plum dipping sauce", "Sauces", 20, "ml", "Sauce Prep", 60, 2),
])

# ── Coffee ────────────────────────────────────────────────
add(50, "Americano", [("espresso", "Beverages", 2, "shots", "Beverage Station", 30, 1)])
add(51, "Soy Latte", [
    ("espresso", "Beverages", 2, "shots", "Beverage Station", 30, 1),
    ("soy milk", "Dairy Alternatives", 200, "ml", "Beverage Station", 10, 1),
])
add(52, "Soy Mocha", [
    ("espresso", "Beverages", 2, "shots", "Beverage Station", 30, 1),
    ("soy milk", "Dairy Alternatives", 180, "ml", "Beverage Station", 10, 1),
    ("chocolate syrup", "Sauces", 30, "ml", "Beverage Station", 180, 1),
])
add(53, "Vegan Iced Coffee", [
    ("espresso", "Beverages", 2, "shots", "Beverage Station", 30, 1),
    ("oat milk", "Dairy Alternatives", 150, "ml", "Beverage Station", 10, 1),
])
add(54, "Iced Brown Sugar Oat Latte", [
    ("espresso", "Beverages", 2, "shots", "Beverage Station", 30, 1),
    ("oat milk", "Dairy Alternatives", 200, "ml", "Beverage Station", 10, 1),
    ("brown sugar syrup", "Sauces", 20, "ml", "Beverage Station", 90, 1),
])
add(55, "Decaf Coffee", [("decaf espresso", "Beverages", 2, "shots", "Beverage Station", 30, 1)])
add(56, "Organic Tea", [("organic tea leaves", "Beverages", 5, "g", "Beverage Station", 365, 1)])
add(57, "Soy Chai Latte", [
    ("chai concentrate", "Beverages", 100, "ml", "Beverage Station", 14, 2),
    ("soy milk", "Dairy Alternatives", 150, "ml", "Beverage Station", 10, 1),
])
add(58, "London Fog", [
    ("earl grey tea", "Beverages", 5, "g", "Beverage Station", 365, 1),
    ("oat milk", "Dairy Alternatives", 150, "ml", "Beverage Station", 10, 1),
    ("vanilla syrup", "Sauces", 15, "ml", "Beverage Station", 180, 1),
])
add(59, "Hot Chocolate", [
    ("chocolate mix", "Beverages", 30, "g", "Beverage Station", 180, 1),
    ("oat milk", "Dairy Alternatives", 200, "ml", "Beverage Station", 10, 1),
])
add(60, "Matcha Latte", [
    ("matcha powder", "Beverages", 4, "g", "Beverage Station", 180, 2),
    ("oat milk", "Dairy Alternatives", 200, "ml", "Beverage Station", 10, 1),
])
add(61, "Iced Oat Strawberry Matcha", [
    ("matcha powder", "Beverages", 3, "g", "Beverage Station", 180, 2),
    ("oat milk", "Dairy Alternatives", 150, "ml", "Beverage Station", 10, 1),
    ("strawberry puree", "Beverages", 40, "ml", "Beverage Station", 7, 2),
])
add(62, "Iced Lychee", [("lychee syrup", "Beverages", 60, "ml", "Beverage Station", 90, 1)])
add(63, "Iced Pineapple", [("pineapple juice", "Beverages", 250, "ml", "Beverage Station", 7, 1)])
add(64, "Sparkling Yuzu", [
    ("yuzu juice", "Beverages", 40, "ml", "Beverage Station", 30, 1),
    ("sparkling water", "Beverages", 200, "ml", "Beverage Station", 365, 1),
])
add(65, "Iced Passion Fruit Green Tea", [
    ("green tea", "Beverages", 5, "g", "Beverage Station", 365, 1),
    ("passion fruit puree", "Beverages", 40, "ml", "Beverage Station", 14, 1),
])
add(66, "Assorted Soft Drinks", [("soft drink can", "Beverages", 1, "can", "Beverage Station", 365, 1)])
add(67, "Raspberry Lime Italian Soda", [
    ("raspberry syrup", "Beverages", 40, "ml", "Beverage Station", 90, 1),
    ("lime juice", "Beverages", 15, "ml", "Beverage Station", 14, 1),
    ("sparkling water", "Beverages", 200, "ml", "Beverage Station", 365, 1),
])
add(68, "Iced Blackberry Hibiscus Tea", [
    ("hibiscus tea", "Beverages", 5, "g", "Beverage Station", 365, 1),
    ("blackberry puree", "Beverages", 30, "ml", "Beverage Station", 7, 1),
])

# ── Desserts ──────────────────────────────────────────────
add(69, "Cheesecake", [
    ("vegan cheesecake base", "Desserts", 1, "slice", "Dessert Station", 5, 3),
])
add(70, "Panna Cotta", [
    ("coconut cream", "Dairy Alternatives", 150, "ml", "Dessert Station", 7, 3),
    ("agar agar", "Desserts", 3, "g", "Dessert Station", 365, 2),
    ("vanilla extract", "Desserts", 3, "ml", "Dessert Station", 365, 1),
])
add(71, "Fried Banana with Coconut Ice Cream", [
    ("banana", "Produce", 2, "pc", "Dessert Station", 5, 1),
    ("batter mix", "Starches", 40, "g", "Fry Station", 90, 1),
    ("coconut ice cream", "Desserts", 80, "g", "Dessert Station", 60, 1),
    ("cooking oil", "Oils", 150, "ml", "Fry Station", 180, 1),
])
add(72, "Vegan Ice Cream", [
    ("vegan ice cream", "Desserts", 120, "g", "Dessert Station", 60, 1),
])
add(73, "Chocolate Mousse", [
    ("dark chocolate", "Desserts", 60, "g", "Dessert Station", 180, 2),
    ("coconut cream", "Dairy Alternatives", 100, "ml", "Dessert Station", 7, 2),
    ("aquafaba", "Desserts", 60, "ml", "Dessert Station", 3, 3),
])

# ── Extras ────────────────────────────────────────────────
add(74, "Extra Protein", [("vegan chicken", "Proteins", 80, "g", "Wok Station", 5, 1)])
add(75, "Extra Tofu", [("firm tofu", "Proteins", 80, "g", "Wok Station", 7, 1)])
add(76, "Extra Veggies", [("mixed vegetables", "Produce", 100, "g", "Wok Station", 5, 1)])
add(77, "Sub Coconut Rice (+1)", [
    ("jasmine rice", "Starches", 200, "g", "Rice Station", 365, 1),
    ("coconut milk", "Dairy Alternatives", 50, "ml", "Rice Station", 14, 2),
])
add(78, "Sub Brown Rice (+1)", [("brown rice", "Starches", 200, "g", "Rice Station", 365, 1)])
add(79, "Add Noodles (Soup)", [("hakka noodles", "Starches", 120, "g", "Rice Station", 3, 1)])

with open(os.path.join(OUT, "recipe_ingredients.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=[
        "menu_item_id", "menu_item_name", "ingredient", "ingredient_category",
        "quantity_per_item", "unit", "prep_group", "shelf_life_days", "complexity_weight"])
    w.writeheader()
    w.writerows(R)
print(f"recipe_ingredients.csv: {len(R)} rows")

# ═══════════════════════════════════════════════════════════
# 3. Generate ingredient_inventory_targets.csv
# ═══════════════════════════════════════════════════════════
all_ingredients = {}
for r in R:
    key = r["ingredient"]
    if key not in all_ingredients:
        all_ingredients[key] = {"unit": r["unit"], "cat": r["ingredient_category"]}

PAR = {
    "Proteins":           lambda: (5000, 2000, 2),
    "Sauces":             lambda: (3000, 1200, 2),
    "Starches":           lambda: (8000, 3000, 3),
    "Produce":            lambda: (4000, 1500, 1),
    "Aromatics":          lambda: (500, 200, 2),
    "Dairy Alternatives": lambda: (5000, 2000, 2),
    "Oils":               lambda: (10000, 4000, 7),
    "Nuts & Seeds":       lambda: (1000, 400, 3),
    "Beverages":          lambda: (2000, 800, 3),
    "Desserts":           lambda: (1000, 400, 3),
    "Supplies":           lambda: (200, 80, 5),
}

import random
random.seed(42)
inv_rows = []
for ing, info in sorted(all_ingredients.items()):
    cat = info["cat"]
    par_fn = PAR.get(cat, lambda: (2000, 800, 3))
    base_par, base_reorder, lead = par_fn()
    jitter = random.uniform(0.7, 1.3)
    unit = info["unit"]
    if unit in ("pc", "can", "shots", "stalks", "slice"):
        par = int(base_par / 20 * jitter)
        reorder = int(base_reorder / 20 * jitter)
    else:
        par = int(base_par * jitter)
        reorder = int(base_reorder * jitter)
    inv_rows.append({
        "ingredient": ing,
        "par_level": par,
        "unit": unit,
        "reorder_threshold": reorder,
        "typical_lead_time_days": lead,
    })

with open(os.path.join(OUT, "ingredient_inventory_targets.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=[
        "ingredient", "par_level", "unit", "reorder_threshold", "typical_lead_time_days"])
    w.writeheader()
    w.writerows(inv_rows)
print(f"ingredient_inventory_targets.csv: {len(inv_rows)} rows")
print("Done.")
