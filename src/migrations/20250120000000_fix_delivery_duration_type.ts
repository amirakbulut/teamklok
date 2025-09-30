import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // First, check if the column exists and what type it is
  const columnInfo = await db.execute(sql`
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_duration'
  `)

  if (columnInfo.rows.length > 0) {
    const currentType = columnInfo.rows[0].data_type

    if (currentType === 'character varying' || currentType === 'text') {
      // Convert text to numeric using USING clause
      await db.execute(sql`
        ALTER TABLE "orders" 
        ALTER COLUMN "delivery_duration" 
        SET DATA TYPE numeric 
        USING delivery_duration::numeric
      `)
    } else if (currentType !== 'numeric') {
      // If it's not numeric, try to convert it
      await db.execute(sql`
        ALTER TABLE "orders" 
        ALTER COLUMN "delivery_duration" 
        SET DATA TYPE numeric 
        USING delivery_duration::numeric
      `)
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Revert back to text type
  await db.execute(sql`
    ALTER TABLE "orders" 
    ALTER COLUMN "delivery_duration" 
    SET DATA TYPE varchar
  `)
}

