const { supabase } = require('./src/services/supabaseStorage');
const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlPath = path.join(__dirname, 'update_packages_continent.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');

// Split into individual statements (simple split by semicolon, not perfect but works for this file)
const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

async function runMigrations() {
  console.log(`Running ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    
    try {
      console.log(`Executing statement ${i + 1}: ${stmt.substring(0, 100)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });
      if (error) {
        // If rpc doesn't work, try direct query
        const { error: queryError } = await supabase.from('packages').select('*').limit(0);
        // Actually, we can't execute arbitrary SQL via the client easily.
        // Let's try using the supabase client's query method for raw SQL.
        // Alternatively, we can use the postgrest-js directly, but let's try a different approach.
        console.error('RPC method failed, trying direct query method');
        // We'll use the supabase client's query method via the db property if available
        // But note: the supabase-js client doesn't expose a direct way to execute arbitrary SQL.
        // We'll have to use a workaround or use the management API.
        // Since we are in a Node environment, we can use the @supabase/supabase-js to execute SQL via rpc if enabled.
        // Alternatively, we can use the PostgreSQL client directly, but we don't have the connection string.
        // Let's check if we can use the supabase client's rpc to call a function that executes SQL.
        // However, we don't have such a function in the database.
        // We'll have to use the management API or use the psql command line.
        // Given the complexity, let's switch to using the psql command line if available.
        // We'll break out and try a different approach.
        throw new Error(`Direct execution not implemented: ${queryError.message}`);
      }
      console.log(`Statement ${i + 1} executed successfully`);
    } catch (err) {
      console.error(`Error executing statement ${i + 1}:`, err.message);
      // Continue with other statements?
      // For now, we'll stop on error.
      throw err;
    }
  }
  
  console.log('All statements executed successfully');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});