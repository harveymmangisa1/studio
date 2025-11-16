-- 1) Fiscal periods for period locking
create table if not exists fiscal_periods (
  id uuid primary key default gen_random_uuid(),
  period text not null unique, -- format YYYY-MM
  status text not null check (status in ('Open','Closed')) default 'Open',
  closed_at timestamptz
);

-- 2) products: add average cost for weighted average method
alter table products
  add column if not exists avg_cost numeric(14,4) default 0;

-- 3) stock_movements: ensure unit_cost for valuation
alter table stock_movements
  add column if not exists unit_cost numeric(14,4) default 0;

-- Optional helper view: current stock per product from movements
create or replace view v_product_stock as
select
  sm.product_id,
  sum(sm.qty_change) as current_qty
from stock_movements sm
group by sm.product_id;
