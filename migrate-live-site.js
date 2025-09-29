// migrate-live-site.js - Canlı site için güvenli migration
const mongoose = require('mongoose');
require('dotenv').config();

// User modelini tanımla (canlı sitedeki mevcut yapı)
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpire: {
        type: Date
    }
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

const User = mongoose.model('User', UserSchema);

async function migrateLiveSite() {
    try {
        console.log('MongoDB bağlanıyor...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB bağlandı');

        // Mevcut kullanıcıları kontrol et
        const users = await User.find({ isAdmin: false });
        console.log(`📊 Toplam ${users.length} kullanıcı bulundu`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                console.log(`\n👤 Kullanıcı işleniyor: ${user.email}`);
                
                // Eğer createdAt yoksa ObjectId'den çıkar
                if (!user.createdAt) {
                    const objectIdDate = new Date(parseInt(user._id.toString().substring(0, 8), 16) * 1000);
                    console.log(`   📅 ObjectId'den çıkarılan tarih: ${objectIdDate}`);
                    
                    // Güvenli güncelleme
                    const result = await User.updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                createdAt: objectIdDate,
                                updatedAt: objectIdDate
                            }
                        }
                    );
                    
                    if (result.modifiedCount > 0) {
                        console.log(`   ✅ ${user.email} için createdAt eklendi`);
                        updatedCount++;
                    } else {
                        console.log(`   ⚠️  ${user.email} için güncelleme yapılamadı`);
                    }
                } else {
                    console.log(`   ✅ ${user.email} zaten createdAt'e sahip: ${user.createdAt}`);
                }
                
            } catch (error) {
                console.error(`   ❌ ${user.email} için hata:`, error.message);
                errorCount++;
            }
        }

        console.log('\n=== MIGRATION SONUÇLARI ===');
        console.log(`✅ Başarıyla güncellenen: ${updatedCount}`);
        console.log(`❌ Hata alan: ${errorCount}`);
        console.log(`📊 Toplam işlenen: ${users.length}`);

        // Son kontrol
        const finalUsers = await User.find({ isAdmin: false }).limit(5);
        console.log('\n=== ÖRNEK KULLANICILAR ===');
        finalUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   createdAt: ${user.createdAt}`);
            console.log(`   updatedAt: ${user.updatedAt}`);
        });

    } catch (error) {
        console.error('❌ Migration hatası:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 MongoDB bağlantısı kapatıldı');
        console.log('✅ Migration tamamlandı!');
    }
}

// Migration'ı çalıştır
migrateLiveSite();
