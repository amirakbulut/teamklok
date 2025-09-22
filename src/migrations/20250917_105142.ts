import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"link_primary_id" integer,
  	"link_secondary_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"link_primary_id" integer,
  	"link_secondary_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_link_primary_id_pages_id_fk" FOREIGN KEY ("link_primary_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_link_secondary_id_pages_id_fk" FOREIGN KEY ("link_secondary_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_link_primary_id_pages_id_fk" FOREIGN KEY ("link_primary_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_link_secondary_id_pages_id_fk" FOREIGN KEY ("link_secondary_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_link_primary_idx" ON "pages_blocks_hero" USING btree ("link_primary_id");
  CREATE INDEX "pages_blocks_hero_link_secondary_idx" ON "pages_blocks_hero" USING btree ("link_secondary_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_link_primary_idx" ON "_pages_v_blocks_hero" USING btree ("link_primary_id");
  CREATE INDEX "_pages_v_blocks_hero_link_secondary_idx" ON "_pages_v_blocks_hero" USING btree ("link_secondary_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;`)
}
