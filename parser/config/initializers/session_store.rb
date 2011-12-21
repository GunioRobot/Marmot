# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_popcorn_session',
  :secret      => '86db078b32102b7e59e9261011dcf982b6b76bd976dd81a4179874d211feab778bea1bbfe0c51739adbafbdfcce13e604ed91b4514812f80a235a398b9cd63fb'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
