-- Drop tables in reverse order of dependencies to ensure a clean rebuild
DROP TABLE IF EXISTS escrow_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS event_plan_items CASCADE;
DROP TABLE IF EXISTS event_plans CASCADE;
DROP TABLE IF EXISTS saved_services CASCADE;
DROP TABLE IF EXISTS service_images CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS vendor_documents CASCADE;
DROP TABLE IF EXISTS vendor_profiles CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS event_types CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(120),
    phone         VARCHAR(20),
    preferred_language VARCHAR(5) DEFAULT 'en',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- 2. CUSTOMER PROFILES
CREATE TABLE customer_profiles (
    customer_id   INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    address       VARCHAR(255),
    city          VARCHAR(100),
    avatar_url    VARCHAR(500)
);

-- 3. EVENT TYPES
CREATE TABLE event_types (
    event_type_id SERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,
    slug          VARCHAR(80) UNIQUE NOT NULL,
    description   TEXT,
    image_url     VARCHAR(500),
    is_active     BOOLEAN DEFAULT TRUE
);

-- 4. CATEGORIES
CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,
    slug          VARCHAR(100) UNIQUE NOT NULL,
    description   TEXT,
    icon_name     VARCHAR(50),
    image_url     VARCHAR(500),
    sort_order    INTEGER DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE
);

-- 5. SUBCATEGORIES
CREATE TABLE subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    category_id    INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    name           VARCHAR(80) NOT NULL,
    slug           VARCHAR(100),
    description    TEXT,
    sort_order     INTEGER DEFAULT 0,
    is_active      BOOLEAN DEFAULT TRUE
);

-- 6. VENDOR PROFILES
CREATE TABLE vendor_profiles (
    vendor_id             INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    vendor_type           VARCHAR(50) CHECK (vendor_type IN ('company', 'freelancer')) NOT NULL,
    company_name          VARCHAR(150),
    company_description   TEXT,
    address               VARCHAR(255),
    city                  VARCHAR(100),
    logo_url              VARCHAR(500),
    preferred_category_id INTEGER REFERENCES categories(category_id),
    social_links          JSONB DEFAULT '[]', --handles both social media and portfolio websites and the pdf portfolio on vendor documents
    payment_method        VARCHAR(50) CHECK (payment_method IN ('full_online', 'deposit_cash')),
    iban                  VARCHAR(50) NOT NULL,
    registration_status   VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    pending_changes       JSONB,
    pending_changes_at    TIMESTAMP,
    pending_changes_approved_at TIMESTAMP,
    approved_by_admin_id  INTEGER REFERENCES users(user_id),
    approved_at           TIMESTAMP,
    created_at            TIMESTAMP DEFAULT NOW()
);

-- 7. VENDOR DOCUMENTS
CREATE TABLE vendor_documents (
    document_id   SERIAL PRIMARY KEY,
    vendor_id     INTEGER NOT NULL REFERENCES vendor_profiles(vendor_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'commercial_register', 'national_id_front', 'national_id_back', 'portfolio_pdf', etc.
    file_url      VARCHAR(500) NOT NULL,
    uploaded_at   TIMESTAMP DEFAULT NOW()
);

-- 8. SERVICES
CREATE TABLE services (
    service_id        SERIAL PRIMARY KEY,
    vendor_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id       INTEGER NOT NULL REFERENCES categories(category_id),
    subcategory_id    INTEGER REFERENCES subcategories(subcategory_id),
    title             VARCHAR(150) NOT NULL,
    description       TEXT,
    base_price        DECIMAL(10,2) NOT NULL,
    pricing_unit      VARCHAR(30) DEFAULT 'per_event',
    service_location  VARCHAR(255),
    city              VARCHAR(100),
    capacity          INTEGER,
    is_active         BOOLEAN DEFAULT TRUE,
    avg_rating        DECIMAL(3,2) DEFAULT 0,
    review_count      INTEGER DEFAULT 0,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- 9. SERVICE IMAGES
CREATE TABLE service_images (
    image_id    SERIAL PRIMARY KEY,
    service_id  INTEGER NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    is_primary  BOOLEAN DEFAULT FALSE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 10. SAVED SERVICES
CREATE TABLE saved_services (
    saved_id    SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    service_id  INTEGER NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    saved_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(customer_id, service_id)
);

-- 11. EVENT PLANS
CREATE TABLE event_plans (
    event_id             SERIAL PRIMARY KEY,
    customer_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_type_id        INTEGER REFERENCES event_types(event_type_id),
    name                 VARCHAR(150),
    status               VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'completed', 'cancelled')),
    estimated_total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

-- 12. EVENT PLAN ITEMS
CREATE TABLE event_plan_items (
    event_item_id      SERIAL PRIMARY KEY,
    event_id           INTEGER NOT NULL REFERENCES event_plans(event_id) ON DELETE CASCADE,
    service_id         INTEGER NOT NULL REFERENCES services(service_id),
    event_date         DATE,
    guest_count        INTEGER,
    special_requests   TEXT,
    quantity           INTEGER NOT NULL DEFAULT 1,
    unit_price_at_time DECIMAL(10,2) NOT NULL,
    line_total         DECIMAL(10,2) NOT NULL,
    vendor_item_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (vendor_item_status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    vendor_note        TEXT,
    created_at         TIMESTAMP DEFAULT NOW()
);

-- 13. REVIEWS
CREATE TABLE reviews (
    review_id     SERIAL PRIMARY KEY,
    service_id    INTEGER NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    customer_id   INTEGER NOT NULL REFERENCES users(user_id),
    event_item_id INTEGER REFERENCES event_plan_items(event_item_id),
    rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text   TEXT,
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, customer_id)
);

-- 14. NOTIFICATIONS
CREATE TABLE notifications (
    notification_id   SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_id          INTEGER REFERENCES event_plans(event_id),
    title             VARCHAR(150),
    message_body      TEXT,
    notification_type VARCHAR(30),
    action_url        VARCHAR(255), --: رابط الزر في الإشعار. (مثال: التاجر وافق على الحجز، الرابط يأخذ الزبون مباشرة لصفحة تفاصيل الحجز الخاص به).
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW()
);

-- 15. PAYMENT METHODS
CREATE TABLE payment_methods (
    method_id  SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    provider   VARCHAR(50),
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 16. PAYMENTS
CREATE TABLE payments (
    payment_id      SERIAL PRIMARY KEY,
    event_id        INTEGER NOT NULL REFERENCES event_plans(event_id),
    method_id       INTEGER REFERENCES payment_methods(method_id),
    amount          DECIMAL(10,2) NOT NULL,
    currency        CHAR(3) DEFAULT 'JOD',
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_ref VARCHAR(100),
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 17. ESCROW TRANSACTIONS
CREATE TABLE escrow_transactions (
    escrow_id       SERIAL PRIMARY KEY,
    payment_id      INTEGER NOT NULL REFERENCES payments(payment_id),
    vendor_id       INTEGER NOT NULL REFERENCES users(user_id),
    event_item_id   INTEGER NOT NULL REFERENCES event_plan_items(event_item_id),
    amount_held     DECIMAL(10,2) NOT NULL,
    platform_fee    DECIMAL(10,2) NOT NULL,
    amount_payable  DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
    released_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_event_plans_customer ON event_plans(customer_id);
CREATE INDEX idx_event_plan_items_event ON event_plan_items(event_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
