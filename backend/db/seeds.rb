# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."

# Create a test consultant user
consultant = User.find_or_create_by!(email: 'consultant@arunadoc.com') do |user|
  user.password = 'Password123!'
  user.password_confirmation = 'Password123!'
  user.first_name = 'Dr. John'
  user.last_name = 'Smith'
  user.role = :consultant
  user.status = :active
  user.gmc_number = 'GMC123456'
end

puts "✓ Created consultant user: #{consultant.email}"
puts "  Password: Password123!"
puts "  Role: #{consultant.role}"

# Create a test secretary user
secretary = User.find_or_create_by!(email: 'secretary@arunadoc.com') do |user|
  user.password = 'Password123!'
  user.password_confirmation = 'Password123!'
  user.first_name = 'Jane'
  user.last_name = 'Doe'
  user.role = :secretary
  user.status = :active
end

puts "✓ Created secretary user: #{secretary.email}"
puts "  Password: Password123!"
puts "  Role: #{secretary.role}"

puts "\nSeeding completed!"
