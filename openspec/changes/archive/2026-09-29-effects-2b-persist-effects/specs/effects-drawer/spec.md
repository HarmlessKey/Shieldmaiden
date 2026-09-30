## REMOVED Requirements

### Requirement: Applied instances are held in encounter state only
**Reason**: Step 2b saves applied instances to the database. Storage, loading and
failure behavior now belong to the `effects-instance-storage` capability.
**Migration**: See `effects-instance-storage`. Existing data needs no migration:
nothing was persisted while this requirement was in force.
