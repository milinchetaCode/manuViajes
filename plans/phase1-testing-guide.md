# Phase 1 Testing Guide - Render.com

## Deployment Status

✅ **Committed**: Changes committed to main branch (commit: 7919834)
✅ **Pushed**: Changes pushed to GitHub repository
⏳ **Deploying**: Render.com should automatically deploy the changes

---

## What Was Fixed

### 1. ✅ "Agregar nuevo paquete" Button
- Now creates packages with backend-generated UUIDs
- Packages are immediately saved to Supabase
- Button shows "Creando..." during creation
- Error handling if creation fails

### 2. ✅ Delete Functionality
- Now actually deletes packages from Supabase database
- Shows package name in confirmation dialog
- Smooth fade-out animation
- Error handling if deletion fails

### 3. ✅ Trash Icon
- Already present in the UI
- Now fully functional with backend integration

---

## Testing Steps on Render.com

### Wait for Deployment
1. Go to your Render.com dashboard
2. Check the deployment status for your service
3. Wait for "Live" status (usually 2-5 minutes)
4. Check the logs for any errors

### Test 1: Add New Package

**Steps:**
1. Navigate to `/admin/login`
2. Log in with your admin credentials
3. Go to `/admin/panel`
4. Click the **"Agregar Nuevo Paquete"** button
5. Observe:
   - Button should show "Creando..." briefly
   - A new card should appear with "Nuevo Paquete" as the event name
   - The card should have a UUID (not `pkg-timestamp`)

**Expected Result:**
- ✅ New package card appears
- ✅ Card has a real UUID
- ✅ Button returns to normal state

**Fill in the package:**
6. Enter event name: "Test Package"
7. Enter price: "1000€"
8. Fill in other fields (optional)
9. Click **"Guardar Cambios"**
10. Refresh the page

**Expected Result:**
- ✅ Package persists after refresh
- ✅ All data is saved correctly

### Test 2: Delete Package

**Steps:**
1. On the admin panel, find the test package you just created
2. Click the **trash icon** (🗑️) button
3. Observe the confirmation dialog:
   - Should show: "¿Está seguro de que desea eliminar el paquete 'Test Package'?"
4. Click **"Cancel"**

**Expected Result:**
- ✅ Package remains in the list

**Now delete it:**
5. Click the trash icon again
6. Click **"OK"** to confirm
7. Observe:
   - Card should fade out smoothly
   - Card should disappear
8. Refresh the page

**Expected Result:**
- ✅ Package is gone after refresh
- ✅ Package deleted from database

### Test 3: Error Handling

**Test Network Error (Optional):**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Try to add a package
5. Observe error alert

**Expected Result:**
- ✅ Error message appears
- ✅ Button returns to normal state

### Test 4: Multiple Operations

**Steps:**
1. Add 3 new packages quickly
2. Verify all 3 are created with different UUIDs
3. Delete 2 of them
4. Refresh the page
5. Verify only 1 remains

**Expected Result:**
- ✅ All operations work correctly
- ✅ Data persists correctly

---

## Checking Supabase Database

To verify data is actually being saved/deleted:

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Open the `packages` table
4. Verify:
   - New packages appear with UUIDs
   - Deleted packages are removed
   - All fields are saved correctly

---

## Common Issues & Solutions

### Issue: Button doesn't respond
**Solution:** Check browser console for JavaScript errors

### Issue: "Error creating package" alert
**Possible causes:**
- Supabase connection issue
- Missing environment variables on Render
- Check Render logs for backend errors

### Issue: Delete doesn't work
**Possible causes:**
- Network error
- Supabase RLS policy issue
- Check if using service_role key (not anon key)

### Issue: Changes don't persist
**Possible causes:**
- Form not submitting correctly
- Check if "Guardar Cambios" button is clicked
- Verify Supabase connection

---

## Environment Variables to Verify on Render

Make sure these are set in your Render.com service:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key (not anon key!)
ADMIN_USER=your-admin-username
ADMIN_PASS=your-admin-password
```

---

## Browser Console Commands for Debugging

Open browser console (F12) and try:

```javascript
// Test create endpoint
fetch('/admin/panel/create', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);

// Test delete endpoint (replace UUID)
fetch('/admin/panel/delete/YOUR-UUID-HERE', { method: 'POST' })
  .then(r => console.log(r.status));
```

---

## Success Criteria

Phase 1 is successful if:

- ✅ Add package button creates packages with UUIDs
- ✅ New packages persist after page refresh
- ✅ Delete button removes packages from database
- ✅ Deleted packages don't reappear after refresh
- ✅ No JavaScript errors in console
- ✅ Loading states appear during operations
- ✅ Error messages appear if operations fail

---

## Next Steps After Testing

Once Phase 1 is confirmed working:

### Phase 2: Table Redesign
- Replace card layout with compact table
- Add search/filter functionality
- Implement pagination (20 items per page)
- Add sortable columns
- Create modal or inline editing

See [`plans/admin-panel-fixes-plan.md`](admin-panel-fixes-plan.md) for Phase 2 details.

---

## Rollback Instructions (If Needed)

If Phase 1 causes issues:

```bash
git revert 7919834
git push origin main
```

This will revert to the previous version while Render redeploys.

---

## Support

If you encounter issues:

1. Check Render.com deployment logs
2. Check browser console for errors
3. Check Supabase logs
4. Verify environment variables
5. Test endpoints directly using browser console

---

## Testing Checklist

Print this and check off as you test:

- [ ] Render deployment completed successfully
- [ ] Can access `/admin/panel`
- [ ] "Agregar Nuevo Paquete" button works
- [ ] New package has UUID (not temp ID)
- [ ] New package persists after refresh
- [ ] Delete button shows confirmation
- [ ] Delete removes package from database
- [ ] Deleted package doesn't reappear
- [ ] Trash icon is visible
- [ ] Loading states appear
- [ ] Error handling works
- [ ] Multiple operations work correctly
- [ ] Supabase database reflects changes

---

**Good luck with testing! 🚀**
