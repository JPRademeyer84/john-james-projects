/** Matrix 150 Ubuntu-only backup/restore plan. Never Aureus production. */
export const AUREUS_PROD_REF = "fgubaqoftdeefcakejwu"
export const UBUNTU_REF = "rbyipalrasawbjpsppgu"
export const BACKUP_REFUSED = "Refused. This runner will not connect to Aureus production."

export function assertUbuntuBackupTarget(url) {
  const target = String(url || "")
  if (!target) throw new Error("Ubuntu Afrique backup target is required")
  if (target.includes(AUREUS_PROD_REF)) throw new Error(BACKUP_REFUSED)
  if (target.includes("fgubaqoftdeefcakejwu")) throw new Error(BACKUP_REFUSED)
  return target
}

export function planUbuntuBackup(url) {
  const target = assertUbuntuBackupTarget(url)
  return {
    target,
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
    withDataFromProduction: false,
    steps: [
      "Full Ubuntu database backup",
      "Ubuntu file/media backup",
      "Ubuntu configuration backup",
    ],
    artifacts: {
      database: "ubuntu-db.dump",
      media: "ubuntu-media.tar",
      configuration: "ubuntu-config.json",
    },
  }
}

export function planUbuntuRestore(url) {
  const target = assertUbuntuBackupTarget(url)
  return {
    target,
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
    withDataFromProduction: false,
    steps: [
      "Restore Ubuntu database from ubuntu-db.dump only",
      "Restore Ubuntu file/media from ubuntu-media.tar only",
      "Restore Ubuntu configuration from ubuntu-config.json only",
      "Confirm nft_marketplace_enabled remains false",
      "Confirm public checkout remains closed",
    ],
  }
}

export function planUbuntuRollback(url, lastForwardMigration) {
  const target = assertUbuntuBackupTarget(url)
  const migration = String(lastForwardMigration || "").trim()
  if (migration.includes(AUREUS_PROD_REF)) throw new Error(BACKUP_REFUSED)
  return {
    target,
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
    withDataFromProduction: false,
    lastForwardMigration: migration || null,
    steps: [
      "Do not reverse-migrate financial tables in place",
      "Restore the last Ubuntu database dump",
      "Restore Ubuntu media and configuration backups",
      "Leave unapplied ubuntu-only SQL unapplied",
    ],
  }
}